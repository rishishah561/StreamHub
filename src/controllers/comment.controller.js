import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const comments = await Comment.aggregate([
        { $match: { video: mongoose.Types.ObjectId(videoId) } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ])

    if (!comments) {
        throw new ApiError(404, "Comments not found")
    }

    res.status(200).json(new ApiResponse(200, comments))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    const { _id: owner } = req.user

    const newComment = new Comment({
        content,
        video: videoId,
        owner
    })

    await newComment.save()

    res.status(201).json(new ApiResponse(201, newComment, "Comment added"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
    )

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found")
    }

    res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found")
    }

    res.status(200).json(new ApiResponse(200, null, "Comment deleted"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
