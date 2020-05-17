import os
import requests
from flask import Flask, session, render_template, request, redirect, url_for, flash
from flask_session import Session
from flask_wtf import CSRFProtect
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from forms import RegistrationForm
from werkzeug.security import check_password_hash, generate_password_hash
from ast import literal_eval
import json

app = Flask(__name__)

os.environ["DATABASE_URL"] = "_"
os.environ["FLASK_DEBUG"] = "1"

csrf = CSRFProtect()
csrf.init_app(app)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

app.config["SECRET_KEY"] = "_"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

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
            session["user_id"] = id
            session["username"] = username
            session["song_data"] = []
            session["repertoir"] = {
                "want_to_learn": [],
                "learning": [],
                "learned": []
            }
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
            session["user_id"] = query[2]
            session["username"] = query[0]
            session["song_data"] = []
            session["repertoir"] = {
                "want_to_learn": [],
                "learning": [],
                "learned": []
            }
            userData = db.execute("SELECT song_data FROM user_data WHERE user_id = :user_id",
                {"user_id": session["user_id"]}).fetchall()
            for song in userData:
                session["song_data"].append(dict(song[0]))
                session["repertoir"]["want_to_learn"].append(song[0]["id"])
            print(session["repertoir"])
            flash("you are logged in!", category="success")
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
        songData = {
            "id": deezerData["id"],
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
        session["song_data"].append(songData)
        session["repertoir"]["want_to_learn"].append(songData["id"])
        db.execute("INSERT INTO user_data (song_id, song_data, user_id, list) VALUES (:song_id, :songData, :user_id, 'want_to_learn');",
            {"song_id": songData["id"], "songData": json.dumps(songData), "user_id": session["user_id"] })
        db.commit()
        return redirect("/")

@app.route("/process")
def process():
    action = int(request.args.get("action"))
    songToRemove = int(request.args.get("id"))
    list = request.args.get("from").split()[0]
    print(list)
    for song in session["song_data"]:
        if song["id"] == songToRemove:
            db.execute("DELETE FROM user_data WHERE song_id = :songToRemove",
            {"songToRemove": songToRemove})
            db.commit()
            session["song_data"].remove(song)

            #TODO: replace 'want_to_learn' with list when ready

            session["repertoir"]["want_to_learn"].remove(song["id"])

            break
    return "done"



if __name__ == "__main__":
    app.run(debug=True)
