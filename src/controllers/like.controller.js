import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId })
    
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, { message: "Like removed" }))
    }

    const newLike = new Like({ video: videoId, likedBy: userId })
    await newLike.save()

    return res.status(200).json(new ApiResponse(200, { message: "Like added" }))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId })
    
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, { message: "Like removed" }))
    }

    const newLike = new Like({ comment: commentId, likedBy: userId })
    await newLike.save()

    return res.status(200).json(new ApiResponse(200, { message: "Like added" }))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId })
    
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, { message: "Like removed" }))
    }

    const newLike = new Like({ tweet: tweetId, likedBy: userId })
    await newLike.save()

    return res.status(200).json(new ApiResponse(200, { message: "Like added" }))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const likedVideos = await Like.find({ likedBy: userId, video: { $ne: null } })
        .populate("video", "title videoFile thumbnail")
    return res.status(200).json(new ApiResponse(200, likedVideos))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
