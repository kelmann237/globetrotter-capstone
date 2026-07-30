import os
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

itineraries_bp = Blueprint('itineraries', __name__)

ITINERARIES_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'itineraries.json')

def load_itineraries():
    if not os.path.exists(ITINERARIES_FILE):
        return []
    with open(ITINERARIES_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_itineraries(itineraries):
    with open(ITINERARIES_FILE, 'w', encoding='utf-8') as f:
        json.dump(itineraries, f, indent=2)

@itineraries_bp.route('/itineraries', methods=['GET'])
@jwt_required()
def get_itineraries():
    current_user_id = int(get_jwt_identity())
    itineraries = load_itineraries()
    
    # Filtrer pour ne renvoyer que les itinéraires de l'utilisateur connecté
    user_itineraries = [i for i in itineraries if i.get('user_id') == current_user_id]
    
    return jsonify(user_itineraries), 200

@itineraries_bp.route('/itineraries', methods=['POST'])
@jwt_required()
def create_itinerary():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title')
    destinations = data.get('destinations', [])

    if not title:
        return jsonify({"error": "Le titre de l'itinéraire est obligatoire"}), 400

    itineraries = load_itineraries()
    new_id = max([i['id'] for i in itineraries], default=0) + 1

    new_itinerary = {
        "id": new_id,
        "user_id": current_user_id,
        "title": title,
        "destinations": destinations,
        "start_date": data.get('start_date', ''),
        "end_date": data.get('end_date', '')
    }

    itineraries.append(new_itinerary)
    save_itineraries(itineraries)

    return jsonify(new_itinerary), 201