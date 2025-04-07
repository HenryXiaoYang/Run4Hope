import re

from django import forms
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from Run4Hope.models import Volunteer, Runner


def ValidateUsername(value):
    if not re.match(r'^[\w.@+-]+$', value):
        raise ValidationError("The username can contain only letters, numbers, and _, @, +, ., -")


class AddRunnerForm(forms.Form):
    def __init__(self, *args, **kwargs):
        self.instance_id = kwargs.pop('instance_id', None)
        super().__init__(*args, **kwargs)

    name = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Name", "class": "form-field"}),
        max_length=100
    )
    student_id = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Student ID（Optional）", "class": "form-field"}),
        required=False,
        help_text="If there is no student ID, you can leave it blank"
    )
    house = forms.ChoiceField(
        choices=[("Spring", "Spring"), ("Summer", "Summer"), ("Autumn", "Autumn"), ("Winter", "Winter")],
        widget=forms.Select(attrs={"class": "form-field"})
    )
    lap_count = forms.IntegerField(
        initial=0,
        widget=forms.NumberInput(attrs={"class": "form-field"}),
        validators=[MinValueValidator(0), MaxValueValidator(1000)]
    )

    def clean_student_id(self):
        student_id = self.cleaned_data.get("student_id")
        if student_id:
            # 检查是否存在相同学号的其他学生（排除当前正在编辑的学生）
            existing_runner = Runner.objects.filter(student_id=student_id).exclude(id=self.instance_id).first()
            if existing_runner:
                raise ValidationError("Student ID already exists!")
        return student_id

    def clean_run_valid(self):
        return True


class AddVolunteerForm(forms.Form):
    student_id = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Student ID", "class": "form-field"}),
        error_messages={"required": "Please enter Student ID"}
    )
    name = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Username", "class": "form-field"}),
        max_length=100,
        validators=[ValidateUsername],
        label="Username"
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-field"})
    )
    re_password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-field"}),
        label="Confirm password"
    )

    def clean_student_id(self):
        student_id = self.cleaned_data["student_id"]
        if Volunteer.exist_student_id(student_id):
            raise ValidationError("The student ID already exists!")
        return student_id

    def check_password(self):
        password = self.cleaned_data["password"]
        re_password = self.cleaned_data["re_password"]
        if password != re_password:
            self.add_error(None, "The two passwords are different!")
            return False
        elif re_password == "":
            self.add_error(None, "Please enter password")
            return False
        elif len(re_password) < 5:
            self.add_error(None, "The password must contain at least 5 characters")
            return False
        return True
