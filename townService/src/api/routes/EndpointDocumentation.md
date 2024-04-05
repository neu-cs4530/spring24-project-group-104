GET /:userID

Description: Retrieves a list of friends for the given user ID.
Parameters: userID (path parameter, required) - The ID of the user.
Responses:
200 OK - Returns a list of friends.
500 Internal Server Error - Error retrieving friendships.

POST /requests

Description: Creates a new friend request.
Body:
userID1 (required) - The ID of the user sending the request.
userID2 (required) - The ID of the user receiving the request.
Responses:
201 Created - Friendship created.
500 Internal Server Error - Error creating friendship.

GET /requests/:userID

Description: Retrieves a list of incoming and outgoing friend requests for the given user ID.
Parameters: userID (path parameter, required) - The ID of the user.
Responses:
200 OK - Returns an object with two properties: incoming and outgoing, each containing a list of friend requests.
500 Internal Server Error - Error retrieving friendships.

PATCH /requests

Description: Deletes a friend request and optionally creates a friendship.
Body:
requesterID (required) - The ID of the user who sent the request.
receiverID (required) - The ID of the user who received the request.
accept (required) - A boolean indicating whether the request was accepted.
Responses:
200 OK - Friendship created or friend request deleted.
500 Internal Server Error - Error creating friendship.

GET /search/:searchTerm

Description: Searches for users by display name.
Parameters: searchTerm (path parameter, required) - The term to search for in user display names.
Responses:
200 OK - Returns a list of up to 10 users whose display name contains the search term.
500 Internal Server Error - Error searching users.