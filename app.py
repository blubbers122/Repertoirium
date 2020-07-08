import os
import requests
from flask import Flask, session, render_template, request, redirect, url_for, flash, jsonify
from flask_session import Session
from flask_wtf import CSRFProtect
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from werkzeug.security import check_password_hash, generate_password_hash
from ast import literal_eval
import json
from flask_socketio import SocketIO, emit
from datetime import datetime

# set up app and socket
app = Flask(__name__)
socketio = SocketIO(app)

# protect app from cross-site request forgery
csrf = CSRFProtect()
csrf.init_app(app)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# set the flask environment variables
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

# initialize flask session and database
Session(app)
engine = create_engine(os.environ.get("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

# sets up user data when user logs in or registers
def initializeSession(id, username, firstLogin):
    session["user_id"] = id
    session["username"] = username
    session["result_limit"] = 20
    session["ids"] = []
    session["repertoir"] = {
        "want_to_learn": {},
        "learning": {},
        "learned": {}
    }

    if not firstLogin:
        userData = db.execute("SELECT song_data, list, song_id FROM user_data WHERE user_id = :user_id",
            {"user_id": session["user_id"]}).fetchall()

        # goes through database query result and loops through each song and adds it to session
        for item in userData:
            data = dict(item[0])
            list = item[1]
            songId = item[2]
            session["repertoir"][list][songId] = data
            session["ids"].append(songId)

# display the welcome page or the main page
# can also handle POST
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":

        # removes user from session on logout
        if request.form.get("action") == "logout":
            session.clear()
            flash("successfully logged out")

        # routes the user to search.html with the desired search term
        else:
            q = request.form.get("search-term")
            session["q"] = q
            return redirect(url_for("search"))

    # returns index.html for a GET request
    loggedIn = "user_id" in session
    return render_template("index.html", session=session, loggedIn=loggedIn)

@app.route("/register", methods=["GET", "POST"])
def register():
    session.clear()

    # handles submit of the register form
    if request.method == "POST":
        username = request.form.get("username")
        query = db.execute("SELECT username FROM users WHERE username = :username",
            {"username": username}).first()

        # if the username was available, store the username and password hash
        # into the database and initialize the session
        if not query:
            hash = generate_password_hash(request.form.get("password"))
            id = db.execute("INSERT INTO users (username, hash) VALUES (:username, :hash) RETURNING id;",
                {"username": username, "hash": hash}).first()[0]
            db.commit()
            initializeSession(id, username, True)
            return redirect("/")
        else:
            flash("username already taken.")

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():

    # handles the submit of the login form
    if request.method == "POST":
        inputUsername = request.form.get("username")
        inputPass = request.form.get("password")
        query = db.execute("SELECT username, hash, id FROM users WHERE username = :username",
            {"username": inputUsername}).first()

        # if the username or password didn't pass validation
        if not query or not check_password_hash(query[1], inputPass):
            flash("Incorrect username and/or password")
            return render_template("login.html")

        # logs the user in
        else:
            initializeSession(query[2], query[0], False)
            return redirect("/")
    return render_template("login.html")

@app.route("/search", methods=["GET"])
def search():

    # must be logged in to access this page
    if "username" not in session:
        return redirect("/")

    # determines how many search results are loaded
    result_limit = request.args.get("result_limit")
    if result_limit:
        session["result_limit"] = result_limit

    url = "https://deezerdevs-deezer.p.rapidapi.com/search"

    querystring = {
        "q": session["q"],
        "index": 0,
        "limit": session["result_limit"]
    }

    headers = {
        'x-rapidapi-host': "deezerdevs-deezer.p.rapidapi.com",
        'x-rapidapi-key': "4024b7a351msh7ccac676888bfc0p1d40b0jsnbf149a89b168"
        }

    # sends the GET request to the deezer API
    response = requests.request("GET", url, headers=headers, params=querystring)

    # loads the results
    if "data" in response.json():
        results = response.json()["data"]
        return render_template("search.html", session=session, results=results)
    # informs user that no search results were found
    else:
        return render_template("search.html", session=session, results=False)

# handles the chat page
@app.route("/chat", methods=["GET"])
def chat():
    if "username" not in session:
        return redirect("/")
    return render_template("chat.html", session=session)

# handles a new received message from the chat
@socketio.on("add chat")
def addChat(data):
    emit("new message", data, broadcast=True)

# handles the bulk of the AJAX related to changing the user's data
@app.route("/update", methods=["PUT", "POST"])
def update():

    if request.method == "PUT":
        response = request.get_json()
        action = response["action"] # the action to take on the data
        id = int(response["id"]) # the songs id
        prev = response["list"] # the list the song is in

        # for removing data from song_data
        if action == "remove data":
            key = response["key"]
            value = response["value"]
            session["repertoir"][prev][id][key].remove(value)
            db.execute("UPDATE user_data SET song_data = :data WHERE song_id = :id AND user_id = :userId",
            {"data": json.dumps(session["repertoir"][prev][id]), "id":id, "userId": session["user_id"]})
            db.commit()

        # for deleting song
        elif action == "delete":
            db.execute("DELETE FROM user_data WHERE song_id = :id AND user_id = :userId",
            {"id": id, "userId": session["user_id"]})
            db.commit()
            del session["repertoir"][prev][id]
            session["ids"].remove(id)

        # for replacing data from song_data
        elif action == "change data":
            key = response["key"]
            value = response["value"]
            if key == "tempo_data":
                session["repertoir"][prev][id][key] = value
            else:
                session["repertoir"][prev][id][key].append(value)
            db.execute("UPDATE user_data SET song_data = :data WHERE song_id = :id AND user_id = :userId",
            {"data": json.dumps(session["repertoir"][prev][id]), "id":id, "userId": session["user_id"]})
            db.commit()

        # for updating tempo data for a song
        elif action == "update tempo data":
            key = response["key"]
            value = response["value"]
            if key == "current_tempo":
                current_time = datetime.now()
                session["repertoir"][prev][id]["tempo_data"]["tempo_logs"].append([int(value), current_time.strftime('%m/%d/%Y')])
            session["repertoir"][prev][id]["tempo_data"][key] = value
            db.execute("UPDATE user_data SET song_data = :data WHERE song_id = :id AND user_id = :userId",
            {"data": json.dumps(session["repertoir"][prev][id]), "id":id, "userId": session["user_id"]})
            db.commit()

        # for updating song lists
        else:
            to = response["to"]
            songtomove = session["repertoir"][prev][id]
            del session["repertoir"][prev][id]
            session["repertoir"][to][id] = songtomove
            db.execute("UPDATE user_data SET list = :list WHERE song_id = :id AND user_id = :userId",
            {"list": to, "id": id, "userId": session["user_id"]})
            db.commit()
        return "done"

    # for adding song to repertoir
    else:
        response = request.get_json()
        data = literal_eval(response["data"])
        list = response["list"]
        id = data["id"]

        # reorganizes the deezer data received into a more lightweight format for storage
        songData = {
            "title": data["title"],
            "tags": [],
            "tempo_data": {
                "track_tempo": 0, # don't track tempo initially
                "current_tempo": "",
                "desired_tempo": "",
                "tempo_logs": [] # stores history of tempo progression
            },
            "preview": data["preview"],
            "artist": {
                "name": data["artist"]["name"],
                "picture": data["artist"]["picture"],
                "link": data["artist"]["link"]
                },
            "album": {
                "title": data["album"]["title"],
                "cover": data["album"]["cover"],
                "link": data["album"]["tracklist"]
                }
        }

        # stores the new song's id key into an array for easy access to its JSON data
        session["ids"].append(id)

        # stores the song's JSON data into the appropriate location in the user's repertoir
        session["repertoir"][list][id] = songData
        db.execute("INSERT INTO user_data (song_id, song_data, user_id, list) VALUES (:song_id, :songData, :user_id, :list);",
            {"song_id": id, "songData": json.dumps(songData), "user_id": session["user_id"], "list": list })
        db.commit()

        return "done"

@app.route("/resetAccount", methods=["POST"])
def resetAccount():

    # deletes all song and tempo data connected to user
    db.execute("DELETE FROM user_data WHERE user_id = :userId",
    {"userId": session["user_id"]})
    response = request.get_json()

    # completely removes account from database
    if response["action"] == "delete":
        db.execute("DELETE FROM users WHERE id = :userId",
        {"userId": session["user_id"]})
        session.clear()

    # resets the data connected to the user's account
    else:
        session["ids"] = []
        session["repertoir"] = {
            "want_to_learn": {},
            "learning": {},
            "learned": {}
        }
    db.commit()
    return "done"

if __name__ == "__main__":
    app.run(debug=True)
