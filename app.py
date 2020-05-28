import os
import requests
from flask import Flask, session, render_template, request, redirect, url_for, flash, jsonify
from flask_session import Session
from flask_wtf import CSRFProtect
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from forms import RegistrationForm
from werkzeug.security import check_password_hash, generate_password_hash
from ast import literal_eval
import json

app = Flask(__name__)

os.environ["DATABASE_URL"] = "postgres://nagutwovnrorpu:95810ca66f0a22c30699932d2eed7947b46e8d05e900ecbfbeb13992f0d84e33@ec2-18-215-99-63.compute-1.amazonaws.com:5432/d1bvucnguvc0rn"
os.environ["FLASK_DEBUG"] = "1"

csrf = CSRFProtect()
csrf.init_app(app)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

#app.config["SECRET_KEY"] =
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["DEBUG"] = True
app.config["TESTING"] = True

Session(app)

engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


def initializeSession(id, username, firstLogin):
    session["user_id"] = id
    session["username"] = username
    session["ids"] = []
    session["repertoir"] = {
        "want_to_learn": {},
        "learning": {},
        "learned": {}
    }
    if not firstLogin:
        userData = db.execute("SELECT song_data, list, song_id FROM user_data WHERE user_id = :user_id",
            {"user_id": session["user_id"]}).fetchall()
        for item in userData:
            list = item[1]
            data = dict(item[0])
            songId = item[2]
            session["repertoir"][list][songId] = data
            session["ids"].append(songId)
            print(item)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        if request.form.get("action") == "logout":
            session.clear()
            flash("successfully logged out")
        else:
            q = request.form.get("search-term")
            session["q"] = q
            return redirect(url_for("search"))
    loggedIn = "user_id" in session
    return render_template("index.html", session=session, loggedIn=loggedIn)

@app.route("/register", methods=["GET", "POST"])
def register():
    session.clear()
    form = RegistrationForm()
    if form.validate_on_submit():
        username = request.form.get("username")
        query = db.execute("SELECT username FROM users WHERE username = :username",
            {"username": username}).first()
        if not query:
            hash = generate_password_hash(request.form.get("password"))
            id = db.execute("INSERT INTO users (username, hash) VALUES (:username, :hash) RETURNING id;",
                {"username": username, "hash": hash}).first()[0]
            db.commit()
            initializeSession(id, username, True)
            flash("Thanks for registering!", category="success")
            return redirect("/")
        else:
            flash("username already taken.")
    return render_template("register.html", form=form)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        inputUsername = request.form.get("username")
        inputPass = request.form.get("password")
        query = db.execute("SELECT username, hash, id FROM users WHERE username = :username",
            {"username": inputUsername}).first()
        if not query or not check_password_hash(query[1], inputPass):
            flash("Incorrect username and/or password")
            return render_template("login.html")
        else:
            initializeSession(query[2], query[0], False)
            return redirect("/")
    return render_template("login.html")

@app.route("/search", methods=["GET", "POST"])
def search():
    if "username" not in session:
        return redirect("/")
    if request.method == "GET":
        url = "https://deezerdevs-deezer.p.rapidapi.com/search"

        querystring = {"q": session["q"]}

        headers = {
            'x-rapidapi-host': "deezerdevs-deezer.p.rapidapi.com",
            'x-rapidapi-key': "4024b7a351msh7ccac676888bfc0p1d40b0jsnbf149a89b168"
            }

        response = requests.request("GET", url, headers=headers, params=querystring)
        results = response.json()["data"]
        return render_template("search.html", session=session, results=results)
    else:
        deezerData = literal_eval(request.form.get("song-data"))
        id = deezerData["id"]
        songData = {
            "title": deezerData["title"],
            "preview": deezerData["preview"],
            "artist": {
                "name": deezerData["artist"]["name"],
                "picture": deezerData["artist"]["picture"],
                "link": deezerData["artist"]["link"]
                },
            "album": {
                "title": deezerData["album"]["title"],
                "cover": deezerData["album"]["cover"],
                "link": deezerData["album"]["tracklist"]
                }
        }
        session["ids"].append(id)
        session["repertoir"]["want_to_learn"][id] = songData
        db.execute("INSERT INTO user_data (song_id, song_data, user_id, list) VALUES (:song_id, :songData, :user_id, 'want_to_learn');",
            {"song_id": id, "songData": json.dumps(songData), "user_id": session["user_id"] })
        db.commit()
        return redirect("/")

@app.route("/update", methods=["GET"])
def update():
    action = request.args.get("action")
    id = int(request.args.get("id"))
    prev = request.args.get("from")
    # for deleting songs
    if action == "delete":
        db.execute("DELETE FROM user_data WHERE song_id = :id AND user_id = :userId",
        {"id": id, "userId": session["user_id"]})
        db.commit()
        del session["repertoir"][prev][id]
        session["ids"].remove(id)
    # for future ajax add to repertoir
    elif action == "add":
        pass
    # for updating song lists
    else:
        to = request.args.get("to")
        songtomove = session["repertoir"][prev][id]
        del session["repertoir"][prev][id]
        session["repertoir"][to][id] = songtomove
        db.execute("UPDATE user_data SET list = :list WHERE song_id = :id AND user_id = :userId",
        {"list": to, "id": id, "userId": session["user_id"]})
        db.commit()
    return "done"

if __name__ == "__main__":
    app.run(debug=True)
