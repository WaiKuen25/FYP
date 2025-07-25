import React from "react";

const FollowCard = ({ category, isFollowed, onFollow }) => {
  return (
    <div className="bg-white dark:bg-dark p-4 rounded-lg shadow-md flex flex-col justify-between mb-4 w-full max-w-sm mx-auto bg-cover bg-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${category.imageUrl})`,
        }}
      ></div>
      <div className="relative bg-white dark:bg-opacity-75 p-4 rounded-lg flex-1 mb-2">
        <h3 className="text-lg font-bold dark:text-white">{category.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {category.description}
        </p>
      </div>
      <button
        className={`relative px-4 py-2 rounded-md mt-2 ${
          isFollowed
            ? "bg-gray-500 text-white dark:bg-gray-700"
            : "bg-blue-500 text-white dark:bg-blue-700"
        }`}
        onClick={() => onFollow(category.id)}
      >
        {isFollowed ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
};

export default FollowCard;
