/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import EditFeedModal from "../components/EditFeedModal";
import {
  searchChannels as fetchChannelSearch,
  fetchChannelVideos,
  fetchChannelDetails,
} from "../services/youtubeApi";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import EmptyFeedCallToAction from "../components/EmptyFeedCallToAction";
import SearchPopover from "../components/SearchPopover";
import { IoChevronBack } from "react-icons/io5";
import { IconChevronsLeft } from "@tabler/icons-react";

function FeedPage() {
  const { user } = useAuth();
  const { feedName } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChannels, setHasChannels] = useState(false); // Track if the feed has channels
  const [initialLoad, setInitialLoad] = useState(true); // Track initial load state
  const [feedChannels, setFeedChannels] = useState({});
  const [channelDetails, setChannelDetails] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [currentFeed, setCurrentFeed] = useState(null);

  useEffect(() => {
    loadFeedData();
  }, [feedName, user]);

  const loadFeedData = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const thisFeed = userData.feeds.find(
            (feed) => feed.name === feedName
          );
          if (thisFeed) {
            setCurrentFeed(thisFeed);
            setFeedChannels(
              thisFeed.channels.reduce((acc, channel) => {
                acc[channel.channelId] = channel.channelTitle;
                return acc;
              }, {})
            );
            setHasChannels(thisFeed.channels.length > 0); // Set hasChannels based on channel count
          } else {
            setFeedChannels({});
            setHasChannels(false);
            setInitialLoad(false);
          }
        } else {
          console.log("No such document!");
          setFeedChannels({});
          setHasChannels(false);
          setInitialLoad(false);
        }
      } catch (error) {
        console.error("Error loading feed data:", error);
        setFeedChannels({});
        setHasChannels(false);
        setInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    if (hasChannels) {
      // Only load channel details and videos if we know there are channels
      loadChannelDetails();
    } else {
      setVideos([]);
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, [hasChannels]);

  const loadChannelDetails = async () => {
    const details = {};
    for (const channelId of Object.keys(feedChannels)) {
      try {
        const channelDetail = await fetchChannelDetails(channelId);
        details[channelId] = channelDetail;
      } catch (error) {
        console.error(
          `Error fetching details for channel ${channelId}:`,
          error
        );
      }
    }
    setChannelDetails(details);
    loadFeedVideos(details);
  };

  const loadFeedVideos = async (channelDetailsMap) => {
    setIsLoading(true);
    try {
      let allVideos = [];

      for (const channelId in feedChannels) {
        try {
          const channelVideos = await fetchChannelVideos(channelId);
          if (Array.isArray(channelVideos)) {
            channelVideos.forEach((video) => {
              video.channelDetails = channelDetailsMap[channelId];
              allVideos.push(video);
            });
          }
        } catch (error) {
          console.error(
            `Error fetching videos for channel ${channelId}:`,
            error
          );
        }
      }

      allVideos.sort(
        (a, b) =>
          new Date(b.snippet?.publishedAt || 0) -
          new Date(a.snippet?.publishedAt || 0)
      );

      setVideos(allVideos);
    } catch (error) {
      console.error("Error loading feed videos:", error);
      setVideos([]);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  };

  const handleDeleteFeed = async () => {
    if (!window.confirm("Are you sure you want to delete this feed?")) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedFeeds = userData.feeds.filter(
          (feed) => feed.name !== feedName
        );
        await updateDoc(userDocRef, { feeds: updatedFeeds });
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting feed:", error);
    }
  };

  const handleUpdateFeed = async (
    oldName,
    newName,
    newImage,
    updatedChannels
  ) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedFeeds = userData.feeds.map((feed) => {
          if (feed.name === oldName) {
            return {
              ...feed,
              name: newName,
              image: newImage,
              channels: updatedChannels,
            };
          }
          return feed;
        });

        await updateDoc(userDocRef, { feeds: updatedFeeds });

        if (oldName !== newName) {
          navigate(`/feed/${newName}`);
        } else {
          setFeedChannels(
            updatedChannels.reduce((acc, channel) => {
              acc[channel.channelId] = channel.channelTitle;
              return acc;
            }, {})
          );
          setChannelDetails({});
          setVideos([]);
          setIsLoading(true);
          setHasChannels(updatedChannels.length > 0);

          setTimeout(() => {
            loadChannelDetails();
          }, 100);

          setCurrentFeed((prev) => ({
            ...prev,
            name: newName,
            image: newImage,
            channels: updatedChannels,
          }));
        }
      }
    } catch (error) {
      console.error("Error updating feed:", error);
    }
  };

  // Trigger a reload so newly added channel’s videos appear without manual refresh
  const handleChannelAdded = () => {
    setFeedChannels({});
    setChannelDetails({});
    setVideos([]);
    setIsLoading(true);
    setTimeout(() => {
      loadFeedData();
    }, 100);
  };

  return (
    <div className="min-h-dvh bg-[#121212] text-white p-4">
      <div className="max-w-8xl   mx-auto">
        <div className="flex  md:flex-row justify-between flex-col gap-4  mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-white  transition-colors duration-500">
              <IconChevronsLeft
                size={36}
                strokeWidth={1}
                className=" scale-150 text-white"
              />
            </div>
            <h1 className="text-2xl lg:text-4xl font-medium text-center text-twhite tracking-tight">
              {feedName}
            </h1>
          </Link>
          <div className="flex  space-x-4 w-full max-w-lg">
            <button
              onClick={() => setIsSearchPopoverOpen(true)}
              className="rounded-md bg-white px-6 py-4 text-lg/4 font-medium text-gray-950 w-full text-center drop-shadow-md"
              aria-label="Add channel"
            >
              Add
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-md bg-white px-6 py-4 text-lg/4 font-medium text-gray-950 w-full text-center drop-shadow-md"
              aria-label="Edit feed"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteFeed}
              className="rounded-md px-6 py-4 text-lg/4 font-medium text-gray-50 ring-[1px] ring-white/20 w-full text-center drop-shadow-md"
              aria-label="Delete feed"
            >
              Delete
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Latest Videos</h2>

        {/* Conditional rendering based on initialLoad, hasChannels, and isLoading */}
        {initialLoad ? (
          // Show spinner while initially loading
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : !hasChannels ? (
          <EmptyFeedCallToAction />
        ) : isLoading ? (
          // Show spinner when loading videos after initial load
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id?.videoId || video.id}
                video={video}
                channelDetails={video.channelDetails}
              />
            ))}
          </div>
        )}

        <EditFeedModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateFeed={handleUpdateFeed}
          feed={{
            name: feedName,
            image: currentFeed?.image || "",
            channels: Object.entries(feedChannels).map(
              ([channelId, channelTitle]) => ({
                channelId,
                channelTitle,
              })
            ),
          }}
        />

        <SearchPopover
          isOpen={isSearchPopoverOpen}
          onClose={() => setIsSearchPopoverOpen(false)}
          onChannelAdded={handleChannelAdded}
        />
      </div>
    </div>
  );
}

export default FeedPage;
