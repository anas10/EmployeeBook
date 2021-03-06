/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/profils              ->  index
 * POST    /api/profils              ->  create
 * GET     /api/profils/:id          ->  show
 * PUT     /api/profils/:id          ->  update
 * DELETE  /api/profils/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Question = require('../question/question.model');
var Profil = require('./profil.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Profils
exports.index = function(req, res) {
  Profil.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Gets a single Profil from the DB
exports.show = function(req, res) {
  Profil.findByFriendlyId(req.params.slug)
    .populate('about.question')
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res));
};

// Creates a new Profil in the DB
exports.create = function(req, res) {
  Profil.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
};

// Updates an existing Profil in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Profil.findByFriendlyId(req.params.slug)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res));
};

// Deletes a Profil from the DB
exports.destroy = function(req, res) {
  Profil.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};
