// TODO
// write action creator
// write reducer case
// write thunk and use appropriately

const express = require('express')
const asyncHandler = require('express-async-handler');
const { check } = require('express-validator');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { Notebook, Note } = require('../../db/models');

const router = express.Router();

// all routes will be prefixed by /notes
// GET Notes attached to a specific Notebook
router.get('/notebooks/:id', asyncHandler(async(req, res) => {
      const { id } = req.params
      const foundNotes = await Note.findAll({
            where: {
                  notebookId: id
            }
      })
      if (foundNotes.length > 0) {
            return res.json(foundNotes)
      } else return res.json([])
}))

// GET a specific note
router.get('/:id', asyncHandler(async(req, res) => {
      const { id } = req.params
      const foundNote = await Note.findByPk(id)
      if (foundNote) {
            return res.json(foundNote)
      } else return res.json('Requested note could not be found')
}))

// Create a new Note using info supplied in req.body
router.post('/', restoreUser, asyncHandler(async(req, res, next) => {
      const {title, content, notebookId } = req.body
      const createError = new Error('You must login before creating a note')
      createError.status = 401
      createError.title = ('Server fetch rejected')
      createError.errors = ['You must login before creating a note']

      if (!req.user) return next(createError)

      const userId = req.user.id

      if (userId === undefined) {
            return next(createError)
      } else {
            const newNote = await Note.create({
                  userId,
                  title,
                  content,
                  notebookId
            })
            return res.json(newNote)
      }
}))


// Update a Note's title and/or content in DB
router.patch('/:id', restoreUser, asyncHandler(async(req, res, next) => {
      const { id:noteId } = req.params
      const noteToEdit = await Note.findByPk(noteId)
      const { title, content } = req.body
      const sessionUserId = req.user.id

      if (sessionUserId !== noteToEdit.userId) {
            const editError = new Error('You are not authorized to edit this note')
            editError.status = 401
            editError.title = ('Server fetch rejected')
            editError.errors = ['You are not authorized to edit this note']
            return next(editError)
      }

      // We either update both fields, update title, or update content
      if (title === null) {
            await noteToEdit.update({
                  content
            })
      } else if (content === null) {
            await noteToEdit.update({ title })
      } else {
            await noteToEdit.update({ title, content })
      }
      return res.json(noteToEdit)
}))

// Delete a Note from DB
router.delete('/:id', restoreUser, asyncHandler(async(req, res, next) => {
      const { id:noteId } = req.params;

      const deleteError = new Error('You are not authorized to delete this note')
      deleteError.status = 401
      deleteError.title = ('Server fetch rejected')
      deleteError.errors = ['You are not authorized to delete this note']

      if (!req.user) return next(deleteError)
      
      const sessionUserId = req.user.id
      const noteToDelete = await Note.findByPk(noteId)
      if (noteToDelete.userId !== sessionUserId) {
            return next(deleteError)
      } else {
            await noteToDelete.destroy()
            return res.json({noteId, message: 'success'})
      }
}))

module.exports = router
