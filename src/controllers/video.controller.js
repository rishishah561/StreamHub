import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    let filter = {};
    if (query) {
        filter = { title: { $regex: query, $options: "i" } };
    }

    if (userId && !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const options = {
        page: Number(page),
        limit: Number(limit),
        sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
    };

    if (userId) {
        filter.user = userId;
    }

    const videos = await Video.paginate(filter, options);

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoFile } = req.files;

    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    const video = await uploadOnCloudinary(videoFile[0].path);

    if (!video) {
        throw new ApiError(400, "Error uploading video to Cloudinary");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoUrl: video.url,
        user: req.user._id,
        thumbnail: video.thumbnail, // assuming uploadOnCloudinary also provides thumbnail URL
    });

    return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("user", "fullName email");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;

    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await video.remove();

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json(new ApiResponse(200, video, `Video status updated to ${video.isPublished ? "Published" : "Unpublished"}`));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
