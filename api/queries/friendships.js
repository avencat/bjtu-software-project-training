let { db } = require('../database');


function createFriendship(req, res, next) {}

function deleteFriendship(req, res, next) {}

function getFriendships(req, res, next) {}

function updateFriendships(req, res, next) {
  res.status(400)
    .json({
      status: 'error',
      message: 'Not implemented.'
    });
}

// Add query functions
module.exports = {
  createFriendship,
  deleteFriendship,
  getFriendships,
  updateFriendships
};
