import os

import google.generativeai as genai
import time
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3.1-flash-lite")


def generate_reply(message):

    response = model.generate_content(message)

    return response.text


def generate_reply(message):

    time.sleep(1)

    response = model.generate_content(message)

    return response.text