from flask import Blueprint, request, jsonify, current_app
from authlib.integrations.requests_client import OAuth2Session
from authlib.common.errors import AuthlibBaseError
import requests
from jose import jwt, JWTError
from datetime import datetime, timedelta
from services.user_service import UserService

def create_auth_routes(user_service: UserService):
    auth_bp = Blueprint('auth', __name__)

    @auth_bp.route('/auth/google', methods=['POST'])
    def google_auth():
        """Handle Google OAuth token verification"""
        try:
            data = request.json
            google_token = data.get('token')
            
            current_app.logger.info(f"Received Google auth request with token: {google_token[:50] if google_token else 'None'}...")
            
            if not google_token:
                return jsonify({'error': 'Google token is required'}), 400

            # Verify Google token
            google_user_info = verify_google_token(google_token)
            current_app.logger.info(f"Google token verification result: {google_user_info}")
            
            if not google_user_info:
                return jsonify({'error': 'Invalid Google token'}), 401

            # Get or create user
            user = user_service.get_or_create_user(
                google_id=google_user_info['sub'],
                email=google_user_info['email'],
                name=google_user_info['name'],
                avatar_url=google_user_info.get('picture')
            )

            # Generate JWT token
            jwt_token = generate_jwt_token(user['id'])

            return jsonify({
                'token': jwt_token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'avatar_url': user['avatar_url']
                }
            })

        except Exception as e:
            current_app.logger.error(f"Google auth error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 500

    @auth_bp.route('/auth/verify', methods=['POST'])
    def verify_token():
        """Verify JWT token and return user info"""
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Authorization header required'}), 401

            token = auth_header.split(' ')[1]
            payload = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'], 
                algorithms=['HS256']
            )

            user = user_service.get_user_by_id(payload['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'avatar_url': user['avatar_url']
                }
            })

        except JWTError as e:
            if 'expired' in str(e).lower():
                return jsonify({'error': 'Token expired'}), 401
            else:
                return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            current_app.logger.error(f"Token verification error: {str(e)}")
            return jsonify({'error': 'Token verification failed'}), 500

    def verify_google_token(token: str) -> dict:
        """Verify Google OAuth token and return user info"""
        try:
            current_app.logger.info(f"Verifying Google token with Google API...")
            
            # Verify token with Google
            response = requests.get(
                f'https://oauth2.googleapis.com/tokeninfo?id_token={token}',
                timeout=10
            )
            
            current_app.logger.info(f"Google API response status: {response.status_code}")
            current_app.logger.info(f"Google API response: {response.text}")
            
            if response.status_code != 200:
                current_app.logger.error(f"Google token verification failed with status {response.status_code}")
                return None
                
            user_info = response.json()
            current_app.logger.info(f"Google user info: {user_info}")
            
            # Verify the token is for our app
            expected_client_id = current_app.config['GOOGLE_CLIENT_ID']
            actual_client_id = user_info.get('aud')
            
            current_app.logger.info(f"Expected client ID: {expected_client_id}")
            current_app.logger.info(f"Actual client ID: {actual_client_id}")
            
            if actual_client_id != expected_client_id:
                current_app.logger.error(f"Client ID mismatch: expected {expected_client_id}, got {actual_client_id}")
                return None
                
            return user_info
            
        except Exception as e:
            current_app.logger.error(f"Google token verification error: {str(e)}")
            return None

    def generate_jwt_token(user_id: int) -> str:
        """Generate JWT token for user"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']),
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )

    return auth_bp