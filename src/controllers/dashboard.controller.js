import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const totalVideos = await Video.countDocuments({ owner: mongoose.Types.ObjectId(channelId) })
    const totalSubscribers = await Subscription.countDocuments({ channel: mongoose.Types.ObjectId(channelId) })
    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: mongoose.Types.ObjectId(channelId) }).select('_id') } })
    const totalVideoViews = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ])

    res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalVideoViews: totalVideoViews[0]?.totalViews || 0
    }))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { page = 1, limit = 10 } = req.query

    const videos = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ])

    if (!videos) {
        throw new ApiError(404, "Videos not found")
    }

    res.status(200).json(new ApiResponse(200, videos))
})

export {
    getChannelStats,
    getChannelVideos
}
