package com.rainbowtechsolution.exceptions

class DomainNotFoundException : Exception("Domain is not found")
class RoomNotFoundException : Exception("Room is not found")
class UserAlreadyFoundException(message: String) : Exception(message)
class UserNotFoundException(message: String = "User not found") : Exception(message)
class ValidationException(message: String) : Exception(message)
class PermissionDeniedException() : Exception("Permission denied")
class MessageNotFoundException() : Exception("Message not exists or deleted")