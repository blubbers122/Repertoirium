from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, Email, EqualTo


class RegistrationForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(min=4, max=20)])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=8, max=20)])
    confirmPassword = PasswordField("Confirm Password", validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField("Submit")
