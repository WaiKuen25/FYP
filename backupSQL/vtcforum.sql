-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： localhost
-- 產生時間： 2025 年 04 月 27 日 08:10
-- 伺服器版本： 10.4.28-MariaDB
-- PHP 版本： 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `vtcforum`
--
CREATE DATABASE IF NOT EXISTS `vtcforum` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `vtcforum`;

-- --------------------------------------------------------

--
-- 資料表結構 `adminUsers`
--

DROP TABLE IF EXISTS `adminUsers`;
CREATE TABLE `adminUsers` (
  `adminId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `permission` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `adminUsers`
--

INSERT INTO `adminUsers` (`adminId`, `userId`, `permission`) VALUES
(1, 20000, 1),
(2, 20001, 1),
(3, 20008, 1);

-- --------------------------------------------------------

--
-- 資料表結構 `calendar_tasks`
--

DROP TABLE IF EXISTS `calendar_tasks`;
CREATE TABLE `calendar_tasks` (
  `taskId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `calendar_tasks`
--

INSERT INTO `calendar_tasks` (`taskId`, `userId`, `title`, `description`, `startTime`, `endTime`, `status`, `createdAt`, `updatedAt`) VALUES
(2, 20000, 'FYP deadline', 'FYP', '2024-08-31 16:00:00', '2025-04-28 04:30:00', 'pending', '2025-04-25 13:14:11', '2025-04-25 13:14:11'),
(3, 20000, 'Admin Dashboard', 'Admin Dashboard', '2025-02-17 16:00:00', '2025-02-21 16:00:00', 'pending', '2025-04-27 06:00:29', '2025-04-27 06:00:29');

-- --------------------------------------------------------

--
-- 資料表結構 `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `categoryId` int(11) NOT NULL,
  `categoryName` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `photo` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `category`
--

INSERT INTO `category` (`categoryId`, `categoryName`, `description`, `photo`) VALUES
(1, 'Global', 'Global news and updates', NULL),
(2, 'Health and Life Sciences', 'Health and life sciences news', NULL),
(3, 'Business', 'Business news and updates', NULL),
(4, 'Childcare, Elderly and Community Services', 'Services for childcare, elderly, and community', NULL),
(5, 'Design', 'Design news and updates', NULL),
(6, 'Engineering', 'Engineering news and updates', NULL),
(7, 'Hospitality', 'Hospitality news and updates', NULL),
(8, 'Information Technology', 'IT news and updates', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `feedback`
--

DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `feedbackId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `messageId` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `reason` text NOT NULL,
  `isAccept` tinyint(1) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `feedback`
--

INSERT INTO `feedback` (`feedbackId`, `userId`, `postId`, `messageId`, `type`, `reason`, `isAccept`, `createdAt`) VALUES
(1, 20001, 7, 2, 'spam', 'gg', 1, '2025-04-25 19:47:12');

--
-- 觸發器 `feedback`
--
DROP TRIGGER IF EXISTS `after_feedback_update`;
DELIMITER $$
CREATE TRIGGER `after_feedback_update` AFTER UPDATE ON `feedback` FOR EACH ROW BEGIN
    IF NEW.isAccept = 1 AND OLD.isAccept IS NULL THEN
        UPDATE messages 
        SET disable = 1 
        WHERE postId = NEW.postId AND messageId = NEW.messageId;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 資料表結構 `media`
--

DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `mediaId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `messageId` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `media`
--

INSERT INTO `media` (`mediaId`, `userId`, `postId`, `messageId`, `type`, `name`) VALUES
(6, 20000, 1, 4, 'image/jpeg', '20000_4.jpeg'),
(7, 20000, 6, 1, 'image/jpeg', '20000_1.jpeg'),
(8, 20000, 6, 2, 'image/jpeg', '20000_2.jpeg'),
(9, 20000, 2, 2, 'image/jpeg', '20000_2.jpg'),
(10, 20000, 7, 1, 'image/jpeg', '20000_1.jpeg'),
(11, 20000, 7, 2, 'image/jpeg', '20000_2.jpeg'),
(12, 20000, 9, 14, 'image/png', '20000_14.png'),
(13, 20001, 21, 1, 'image/jpeg', '20001_1.jpg'),
(14, 20001, 22, 1, 'image/jpeg', '20001_1.jpg'),
(16, 20007, 26, 1, 'image/jpeg', '20007_1.JPG');

-- --------------------------------------------------------

--
-- 資料表結構 `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `messageId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `content` text NOT NULL,
  `reply` int(11) DEFAULT NULL,
  `messageTime` datetime DEFAULT current_timestamp(),
  `disable` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `messages`
--

INSERT INTO `messages` (`messageId`, `postId`, `userId`, `content`, `reply`, `messageTime`, `disable`) VALUES
(1, 1, 20000, 'Content', NULL, '2025-01-16 10:24:59', 0),
(1, 2, 20000, '123', NULL, '2025-01-28 18:48:52', 1),
(1, 3, 20000, '123', NULL, '2025-01-28 18:54:58', 0),
(1, 4, 20000, '132', NULL, '2025-01-30 09:57:18', 0),
(1, 5, 20000, 'c1', NULL, '2025-01-31 21:59:55', 1),
(1, 6, 20000, 'The New HKIIT TY is Open', NULL, '2025-02-02 09:06:43', 1),
(1, 7, 20000, 'content', NULL, '2025-02-06 09:57:51', 1),
(1, 8, 20001, 'gdgdgdg', NULL, '2025-02-10 09:29:22', 0),
(1, 9, 20000, '123\r\n456\r\n789', NULL, '2025-02-23 08:26:33', 0),
(1, 10, 20001, '4-21', NULL, '2025-04-21 18:57:13', 0),
(1, 11, 20001, 'Test', NULL, '2025-04-25 12:09:45', 0),
(1, 12, 20001, 'Admin Pin Test Content', NULL, '2025-04-25 12:10:29', 0),
(1, 13, 20001, 'One more test pin Content', NULL, '2025-04-25 12:13:21', 0),
(1, 14, 20001, 'One more test pin Content2', NULL, '2025-04-25 12:17:24', 0),
(1, 15, 20001, 'One more test pin Content 3', NULL, '2025-04-25 12:18:32', 0),
(1, 16, 20001, 'One more test pin Content 4', NULL, '2025-04-25 12:20:09', 0),
(1, 20, 20001, 'abc', NULL, '2025-04-26 17:07:08', 0),
(1, 21, 20001, 'abc', NULL, '2025-04-26 17:08:54', 0),
(1, 22, 20001, 'cde', NULL, '2025-04-26 17:09:40', 0),
(1, 23, 20001, 'cde', NULL, '2025-04-26 17:13:27', 0),
(1, 24, 20001, 'good', NULL, '2025-04-26 17:13:56', 0),
(1, 26, 20007, 'The Hong Kong Design Institute (HKDI) is holding the exhibition \"Hong Kong Design Institute: Emerging Design Talents Exhibition\" for the first time at Nantou City in the Nanshan District, Shenzhen, from now until 13 April 2025. \r\n\r\nThe Chief Executive emphasised in his Policy Address the importance of helping youth seize opportunities in the Greater Bay Area (GBA) across various fields, enabling them to utilise their strengths and contribute to the high-quality development of both Hong Kong and the nation in the future. As an exhibition by the leading design institution in the region, HKDI\'s \"Hong Kong Design Institute: Emerging Design Talents Exhibition\" will showcase a series of outstanding works from students in the departments of Architecture, Interior and Product Design, Communication Design, Digital Media, as well as Fashion and Image Design. The exhibition aims to help students explore and understand opportunities in the GBA by sharing learning experiences, displaying design works, and live performances, while also promoting creative exchanges within the region and enhancing interaction among youth, fostering a sense of national identity.\r\n\r\nThe opening ceremony of the exhibition was held on 29 March 2025 at the Baode Square in Nantou City, officiated by distinguished guests including Dr Michael WANG Jianguo, Deputy Executive Director of the Vocational Training Council (VTC); WANG Yuanhui, Member of the Standing Committee, Nanshan District Committee of Shenzhen Municipal Committee of the CPC and the Minister, Nanshan District Publicity Department of Shenzhen Municipal Committee of the CPC; HUANG Nan, General Manager of Shenzhen Wantong Nantou City Management and Operation Co. Ltd; Freeman LAU,  VTC Honorary Fellow, Chairman of the Design Institute Advisory Board and Dr ONG Lay-lian, Principal of HKDI and IVE (Lee Wai Lee).\r\n\r\nDr Michael WANG Jianguo, Deputy Executive Director of the VTC said, \"This is our first time holding an exhibition at Nantou City. Through direct interaction and communication between students and the community, not only do we enrich their learning experience, but the exhibition also provides a unique opportunity for our students to showcase their ideas and creativity in different places and gain market experience. At the same time, we hope to take this opportunity to promote HKDI\'s creative brand in the GBA.\"\r\n\r\nHUANG Nan, General Manager of Shenzhen Wantong Nantou City Management and Operation Co. Ltd remarked, \"In recent years, we have actively revitalised Nantou City through various measures, hoping to transform the ancient town into a centre for modern culture, art, and design. This time, HKDI has specifically chosen to hold their students\' exhibition at Nantou City, which will help strengthening academic creativity and knowledge exchange within the GBA, consolidating our position as a centre for modern art and culture.\"\r\n\r\nThe Financial Secretary proposed in this year\'s budget to develop artificial intelligence (AI) across various industries. HKDI, which has been committed to integrating AI technology into design, arranged the first AI virtual singer, Vi, created by its students from the Digital Media department, to perform at today’s ceremony, showcasing the institute\'s innovations and efforts in this area.\r\n\r\nFollowing the opening ceremony, students from the Digital Media and Fashion and Image Design departments presented a unique fashion show and hosted several street music performances for the guests.\r\n\r\nNantou City, filled with Lingnan ancient culture and historical relics, serves as a cultural preservation unit in Shenzhen. After renovation, it not only retains its historical value but also highlights the potential of the ancient town as a centre for modern culture, art, and design, attracting a large number of tourists. In addition to the events at Baode Square, the \"Hong Kong Design Institute: Emerging Design Talents Exhibition\" is featuring a series of exhibitions and activities centred around Zhongshan South Street, one of the ancient streets that still exists today.\r\n\r\nWe welcome everyone to visit the \"Hong Kong Design Institute: Emerging Design Talents Exhibition\" and spark more creative exchanges in the culturally rich Nantou City Exhibition details are as follows:', NULL, '2025-04-27 10:40:18', 0),
(2, 1, 20000, 'Tesla', NULL, '2025-02-01 21:11:36', 0),
(2, 2, 20000, 'this is a comment', NULL, '2025-02-04 11:24:20', 0),
(2, 4, 20000, 'Post 4 testing', NULL, '2025-02-01 21:00:28', 0),
(2, 5, 20000, 'Testing\r\n', NULL, '2025-02-01 20:52:58', 0),
(2, 6, 20000, 'Orange Image Test', NULL, '2025-02-03 13:57:42', 0),
(2, 7, 20000, 'sfknskf', NULL, '2025-02-06 09:58:10', 1),
(2, 8, 20001, '1', NULL, '2025-04-21 14:37:06', 0),
(2, 9, 20000, 'reply to index 1\r\n', 1, '2025-02-23 17:14:31', 0),
(2, 24, 20001, 'abc', NULL, '2025-04-26 20:01:17', 0),
(2, 26, 20007, 'More Details In Website: https://www.vtc.edu.hk/home/en/media-newsroom/press-releases/News-from-Institutions-HKDI-Nantou-City-Exhibition.html', NULL, '2025-04-27 10:52:45', 0),
(3, 1, 20000, 'Tesla 2.0\r\n', NULL, '2025-02-01 21:14:38', 0),
(3, 2, 20001, 'hello', NULL, '2025-02-06 10:07:11', 0),
(3, 4, 20000, 'Post 4 Test', NULL, '2025-02-01 21:08:08', 0),
(3, 5, 20000, 'One More Testing', NULL, '2025-02-01 20:53:39', 1),
(3, 7, 20000, '123\r\n', NULL, '2025-02-20 12:39:03', 0),
(3, 8, 20001, '2', NULL, '2025-04-21 14:37:08', 0),
(3, 9, 20001, '456\r\n', NULL, '2025-02-23 18:18:01', 0),
(3, 24, 20001, 'abc', NULL, '2025-04-26 20:44:59', 1),
(4, 1, 20000, 'Tesla 3.0', NULL, '2025-02-01 21:16:04', 0),
(4, 2, 20001, 'bbbbbbbbb', NULL, '2025-04-21 13:58:47', 0),
(4, 5, 20000, 'One More Testing', NULL, '2025-02-01 20:53:42', 1),
(4, 8, 20001, '3', NULL, '2025-04-21 14:37:09', 0),
(4, 9, 20000, '789', NULL, '2025-02-23 18:18:05', 0),
(5, 1, 20001, 'title\r\n', NULL, '2025-04-21 14:31:37', 0),
(5, 2, 20001, 'ccccc', NULL, '2025-04-21 13:58:57', 0),
(5, 5, 20000, '', NULL, '2025-02-01 20:54:31', 1),
(5, 8, 20001, '4', NULL, '2025-04-21 14:37:10', 0),
(5, 9, 20000, '9 10 11\r\n', NULL, '2025-02-23 18:18:17', 0),
(6, 1, 20000, '678\r\n', 1, '2025-04-23 12:28:32', 0),
(6, 2, 20001, 'boring\r\n', NULL, '2025-04-21 14:32:02', 0),
(6, 8, 20001, '5', NULL, '2025-04-21 14:37:11', 0),
(6, 9, 20001, 'test', NULL, '2025-02-23 18:32:50', 0),
(7, 2, 20001, 'xxxx', NULL, '2025-04-21 14:32:09', 0),
(7, 8, 20001, '6', NULL, '2025-04-21 14:37:12', 0),
(7, 9, 20001, '230335287', NULL, '2025-02-23 18:34:22', 0),
(8, 2, 20001, 'reply message', 4, '2025-04-21 14:32:32', 0),
(8, 8, 20001, '7', NULL, '2025-04-21 14:37:15', 0),
(8, 9, 20000, 'Testing ', NULL, '2025-02-24 13:49:31', 0),
(9, 8, 20001, '8', NULL, '2025-04-21 14:37:16', 0),
(9, 9, 20000, 'one more\r\n', NULL, '2025-02-24 14:01:30', 0),
(10, 8, 20001, '9', NULL, '2025-04-21 14:37:20', 0),
(10, 9, 20000, 'two more', NULL, '2025-02-24 14:04:47', 0),
(11, 8, 20001, '10', NULL, '2025-04-21 14:37:25', 0),
(11, 9, 20000, 'X Y', NULL, '2025-02-24 14:07:02', 0),
(12, 9, 20000, 'Replying\r\n', NULL, '2025-02-24 14:22:52', 0),
(13, 9, 20000, '= =', 1, '2025-02-24 14:28:25', 0),
(14, 9, 20000, '123', 1, '2025-02-24 14:28:41', 0),
(15, 9, 20000, '456', 14, '2025-02-24 14:28:46', 0),
(16, 9, 20000, '123', 15, '2025-02-24 14:33:45', 0),
(17, 9, 20000, '123', 15, '2025-02-24 14:45:46', 0),
(18, 9, 20000, '123', NULL, '2025-02-24 14:48:43', 0),
(19, 9, 20000, '456', 17, '2025-02-24 14:48:48', 0),
(20, 9, 20000, 'reply 456', 19, '2025-02-25 09:45:11', 0),
(21, 9, 20000, 'reply on Index 1', 1, '2025-02-25 10:34:27', 0),
(22, 9, 20000, 'reply', 1, '2025-02-25 11:01:20', 0),
(23, 9, 20001, 'jvjb \r\n', NULL, '2025-03-10 11:43:22', 0),
(24, 9, 20001, 'vjhvhj', NULL, '2025-04-15 11:18:27', 0),
(25, 9, 20001, 'jfj', 1, '2025-04-15 11:23:25', 0),
(26, 9, 20001, '123', NULL, '2025-04-21 08:12:14', 0),
(27, 9, 20001, '123', NULL, '2025-04-21 09:10:57', 0),
(28, 9, 20001, '456', NULL, '2025-04-21 13:26:12', 0),
(29, 9, 20001, '123', NULL, '2025-04-21 13:27:59', 0),
(30, 9, 20001, 'xxxxx', NULL, '2025-04-21 13:29:38', 0),
(31, 9, 20001, 'yyyyyy', NULL, '2025-04-21 13:30:37', 0),
(32, 9, 20001, 'zzzzzz', NULL, '2025-04-21 13:33:38', 0),
(33, 9, 20001, 'aaaaaaaa', NULL, '2025-04-21 13:34:08', 0),
(34, 9, 20001, 'bbbbbbbbb', NULL, '2025-04-21 13:36:45', 0),
(35, 9, 20001, 'cccccccc', NULL, '2025-04-21 13:37:10', 0),
(36, 9, 20001, 'efnefnjenfkenf\r\n', NULL, '2025-04-21 13:38:25', 0),
(37, 9, 20001, 'dddd', NULL, '2025-04-21 13:43:28', 0),
(38, 9, 20001, '123', NULL, '2025-04-21 13:46:10', 0),
(39, 9, 20001, '123', NULL, '2025-04-21 14:23:59', 0),
(40, 9, 20001, '123', NULL, '2025-04-21 14:27:49', 0),
(41, 9, 20001, 'fewbfwebfejwf hwefbewbf\r\n', NULL, '2025-04-21 14:28:35', 0),
(42, 9, 20001, 'dknasdk', NULL, '2025-04-21 14:31:07', 0),
(43, 9, 20001, 'yoyo', NULL, '2025-04-21 14:32:50', 0),
(44, 9, 20001, 'abc', NULL, '2025-04-21 18:38:06', 0),
(45, 9, 20001, 'ppp', NULL, '2025-04-21 18:40:55', 0);

--
-- 觸發器 `messages`
--
DROP TRIGGER IF EXISTS `set_messageId_before_insert`;
DELIMITER $$
CREATE TRIGGER `set_messageId_before_insert` BEFORE INSERT ON `messages` FOR EACH ROW BEGIN
    DECLARE maxMessageId INT;

    -- Find the maximum messageId for the given postId
    SELECT COALESCE(MAX(messageId), 0) INTO maxMessageId
    FROM messages
    WHERE postId = NEW.postId;

    -- Set the new messageId
    SET NEW.messageId = maxMessageId + 1;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 資料表結構 `message_reactions`
--

DROP TABLE IF EXISTS `message_reactions`;
CREATE TABLE `message_reactions` (
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `messageId` int(11) NOT NULL,
  `reaction` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `message_reactions`
--

INSERT INTO `message_reactions` (`userId`, `postId`, `messageId`, `reaction`) VALUES
(20000, 1, 1, 0),
(20000, 2, 1, 0),
(20000, 3, 1, 1),
(20000, 4, 1, 1),
(20000, 5, 1, 1),
(20000, 6, 1, 1),
(20000, 7, 2, 1),
(20000, 7, 3, 0),
(20000, 8, 1, 1),
(20000, 9, 1, 0),
(20000, 9, 2, 1),
(20000, 10, 1, 1),
(20001, 1, 1, 1),
(20001, 2, 1, 0),
(20001, 2, 7, 1),
(20001, 3, 1, 1),
(20001, 5, 1, 1),
(20001, 6, 1, 1),
(20001, 7, 1, 0),
(20001, 7, 3, 1),
(20001, 8, 1, 0),
(20001, 9, 1, 1),
(20001, 9, 2, 0),
(20001, 9, 3, 1),
(20001, 9, 4, 1),
(20001, 9, 5, 1),
(20001, 9, 6, 1),
(20001, 9, 7, 0),
(20001, 9, 8, 0),
(20001, 9, 9, 0),
(20001, 9, 10, 1),
(20001, 9, 13, 0),
(20001, 9, 14, 0),
(20001, 9, 21, 0),
(20001, 9, 22, 1),
(20001, 9, 24, 1),
(20001, 9, 25, 0),
(20001, 9, 29, 1),
(20001, 9, 38, 1),
(20001, 9, 44, 0),
(20001, 9, 45, 1),
(20001, 10, 1, 1),
(20001, 16, 1, 1),
(20001, 24, 1, 1),
(20001, 26, 1, 1),
(20007, 26, 1, 1);

-- --------------------------------------------------------

--
-- 資料表結構 `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notificationId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `notifications`
--

INSERT INTO `notifications` (`notificationId`, `userId`, `type`, `content`, `link`, `postId`, `isRead`, `createdAt`) VALUES
(1, 20001, 'normal', 'This is a content', NULL, 11, 1, '2025-04-25 12:31:07'),
(2, 20001, 'broadcast', 'Hi', NULL, NULL, 1, '2025-04-25 14:08:56'),
(3, 20006, 'broadcast', 'Hi', NULL, NULL, 0, '2025-04-25 14:08:57'),
(4, 20005, 'broadcast', 'Hi', NULL, NULL, 0, '2025-04-25 14:08:57'),
(5, 20004, 'broadcast', 'Hi', NULL, NULL, 0, '2025-04-25 14:08:57'),
(6, 20000, 'broadcast', 'Hi', NULL, NULL, 0, '2025-04-25 14:08:57'),
(7, 20002, 'broadcast', 'Hi', NULL, NULL, 0, '2025-04-25 14:08:57'),
(8, 20003, 'broadcast', 'Hi', NULL, NULL, 0, '2025-04-25 14:08:57');

-- --------------------------------------------------------

--
-- 資料表結構 `pinContent`
--

DROP TABLE IF EXISTS `pinContent`;
CREATE TABLE `pinContent` (
  `pinContentId` int(11) NOT NULL,
  `adminId` int(11) NOT NULL,
  `postId` int(11) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `startTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  `disable` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `pinContent`
--

INSERT INTO `pinContent` (`pinContentId`, `adminId`, `postId`, `content`, `startTime`, `endTime`, `disable`) VALUES
(1, 2, 1, 'Testing', '2025-03-09 16:00:00', '2025-03-11 16:00:00', 0),
(2, 2, 2, 'OneMore Test', '2025-03-09 16:00:00', '2025-03-10 16:00:00', 0),
(3, 2, 2, 'Title Content', '2025-03-10 16:00:00', '2025-03-11 04:00:00', 0),
(4, 2, 2, 'fefef', '2025-03-10 16:00:00', '2025-03-11 04:00:00', 0),
(5, 2, 1, 'Pin Title', '2025-04-14 16:00:00', '2025-04-15 08:00:00', 0),
(6, 2, 3, 'abc', '2025-04-24 16:00:00', '2025-04-25 16:00:00', 0),
(7, 2, 24, 'good', '2025-04-25 16:00:00', '2025-04-28 04:00:00', 1);

-- --------------------------------------------------------

--
-- 資料表結構 `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `postId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `postTime` datetime DEFAULT current_timestamp(),
  `pin` int(11) DEFAULT NULL,
  `disable` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `posts`
--

INSERT INTO `posts` (`postId`, `userId`, `categoryId`, `title`, `postTime`, `pin`, `disable`) VALUES
(1, 20000, 1, 'Title', '2025-01-16 10:24:59', NULL, 1),
(2, 20000, 8, 'A RealTime Tester', '2025-01-28 18:48:52', 1, 1),
(3, 20000, 5, 'Tester one more time', '2025-01-28 18:54:58', 1, 1),
(4, 20000, 2, '123', '2025-01-30 09:57:18', 1, 1),
(5, 20000, 1, 'C1 test', '2025-01-31 21:59:55', 1, 1),
(6, 20000, 8, 'HKIIT TY', '2025-02-02 09:06:43', 1, 1),
(7, 20000, 2, 'tile', '2025-02-06 09:57:51', 1, 1),
(8, 20001, 1, 'gdgdg', '2025-02-10 09:29:22', NULL, 1),
(9, 20000, 8, 'Testing Pros', '2025-02-23 08:26:33', 1, 0),
(10, 20001, 1, 'new post in 4-21', '2025-04-21 18:57:13', NULL, 1),
(11, 20001, 1, '4-25', '2025-04-25 12:09:45', NULL, 1),
(12, 20001, 8, 'Admin Pin Test', '2025-04-25 12:10:29', NULL, 1),
(13, 20001, 8, 'One more test pin Content', '2025-04-25 12:13:21', NULL, 1),
(14, 20001, 8, 'One more test pin Content2 ', '2025-04-25 12:17:24', NULL, 1),
(15, 20001, 8, 'One more test pin Content 3', '2025-04-25 12:18:32', NULL, 1),
(16, 20001, 8, 'One more test pin Content 4', '2025-04-25 12:20:09', NULL, 1),
(17, 20001, 1, 'abc', '2025-04-26 16:49:41', NULL, 1),
(18, 20001, 1, 'abc', '2025-04-26 16:50:15', NULL, 1),
(19, 20001, 1, 'abc', '2025-04-26 16:51:16', NULL, 1),
(20, 20001, 1, 'abc', '2025-04-26 17:07:08', NULL, 1),
(21, 20001, 1, 'abc', '2025-04-26 17:08:54', NULL, 1),
(22, 20001, 1, 'cde', '2025-04-26 17:09:40', NULL, 1),
(23, 20001, 1, 'cde', '2025-04-26 17:13:27', NULL, 1),
(24, 20001, 1, 'good', '2025-04-26 17:13:56', 2, 0),
(25, 20007, 5, '[News from Institutions] Hong Kong Design Institute Holds \"Hong Kong Design Institute: Emerging Design Talents Exhibition\" at Nantou City for the First Time', '2025-04-27 10:38:45', NULL, 0),
(26, 20007, 5, '[News from Institutions] Hong Kong Design Institute Holds \"Hong Kong Design Institute: Emerging Design Talents Exhibition\" at Nantou City for the First Time', '2025-04-27 10:40:18', NULL, 0);

-- --------------------------------------------------------

--
-- 資料表結構 `punishments`
--

DROP TABLE IF EXISTS `punishments`;
CREATE TABLE `punishments` (
  `punishmentId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `adminId` int(11) NOT NULL,
  `reason` text NOT NULL,
  `startDate` datetime NOT NULL DEFAULT current_timestamp(),
  `endDate` datetime DEFAULT NULL,
  `isPermanent` tinyint(1) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `punishments`
--

INSERT INTO `punishments` (`punishmentId`, `userId`, `adminId`, `reason`, `startDate`, `endDate`, `isPermanent`, `isActive`, `createdAt`) VALUES
(1, 20006, 2, 'Test Ban', '2025-04-23 20:39:47', '2025-05-23 20:39:47', 0, 0, '2025-04-23 20:39:47');

--
-- 觸發器 `punishments`
--
DROP TRIGGER IF EXISTS `after_punishment_insert`;
DELIMITER $$
CREATE TRIGGER `after_punishment_insert` AFTER INSERT ON `punishments` FOR EACH ROW BEGIN
    UPDATE `users` SET `disable` = 1 WHERE `userId` = NEW.userId;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `after_punishment_update`;
DELIMITER $$
CREATE TRIGGER `after_punishment_update` AFTER UPDATE ON `punishments` FOR EACH ROW BEGIN
    IF NEW.isActive = 0 AND OLD.isActive = 1 THEN
        -- 檢查用戶是否還有其他活動的處罰
        IF NOT EXISTS (SELECT 1 FROM `punishments` WHERE `userId` = NEW.userId AND `isActive` = 1) THEN
            UPDATE `users` SET `disable` = 0 WHERE `userId` = NEW.userId;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nickName` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `disable` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`userId`, `email`, `password`, `nickName`, `department`, `role`, `disable`) VALUES
(20000, 'vpn94810@gmail.com', '$2b$10$BLFH9HJm.CpDhy1rPTIeJuW4dH13IqfKc377hZW1VBZp/Y5/hS0pG', 'vpn94810', NULL, NULL, 0),
(20001, '230335287@stu.vtc.edu.hk', '$2b$10$PD9PdPTA1ANtKyUoPtBCJOie8fiXVnbIDgzoDk.WAOFrUVZ24SQue', '230335287', NULL, NULL, 0),
(20002, 'vtcmessage@vtc.edu.hk', '$2b$10$znmEd3jIz18u47ers1rC6eKmwreC9tPNgXZpq7qTbZz0nOi5Y.VR6', 'VTC Message', 'Campus Secretariat', 'staff', 0),
(20003, 'vtcnews@vtc.edu.hk', '$2b$10$vQgFXEh2DFSsHE2lu.fDJeUDUtuOQB/B2V7CkjE7qna8SYxT.I1dq', 'VTC News', 'Campus Secretariat', 'staff', 0),
(20004, 'testac@stu.vtc.edu.hk', '$2b$10$J/lpYJXvtmyNjU.cIURTGeCeEvRZGfi0Gvnbak1AXg3K44inuCyqe', 'Test Ac', 'Campus Secretariat', 'student', 0),
(20005, 'testac2@gmail.com', '$2b$10$roXxxuzdDoKKFPU9PRHztu3KKjRAMhQ9vRWm0fenGeXxl3QRzXX7G', 'test Ac2', 'Campus Secretariat', 'guest', 0),
(20006, 'ban@gmail.com', '$2b$10$ai3ky28qMqcagB3K/JRpUetepZW5nQSu0iZ5OKAVuff0XmCNabA0O', 'i am baned', 'Campus Secretariat', 'guest', 0),
(20007, 'vtcnews2@vtc.edu.hk', '$2b$10$KK2.9tgXnoaEHF9GvCTI1u4iqBJoxqi/m6qWuBQD9QysbCsZel74C', 'VTC News', 'Campus Secretariat', 'staff', 0),
(20008, 'admintc@stu.vtc.edu.hk', '$2b$10$hznEgrRqkPsFedeFrRZyqOVNrhXftMfgsmukl340wS7u15klK3Nxy', 'Admin Test Account', 'Campus Secretariat', 'student', 0);

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `adminUsers`
--
ALTER TABLE `adminUsers`
  ADD PRIMARY KEY (`adminId`),
  ADD KEY `userId_FK` (`userId`) USING BTREE;

--
-- 資料表索引 `calendar_tasks`
--
ALTER TABLE `calendar_tasks`
  ADD PRIMARY KEY (`taskId`),
  ADD KEY `userId` (`userId`);

--
-- 資料表索引 `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`categoryId`);

--
-- 資料表索引 `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedbackId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `postId` (`postId`),
  ADD KEY `messageId` (`messageId`),
  ADD KEY `feedback_ibfk_3` (`messageId`,`postId`);

--
-- 資料表索引 `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`mediaId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `postId` (`postId`),
  ADD KEY `messageId` (`messageId`),
  ADD KEY `media_ibfk_3` (`messageId`,`postId`);

--
-- 資料表索引 `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageId`,`postId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `postId` (`postId`);

--
-- 資料表索引 `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`userId`,`postId`,`messageId`),
  ADD KEY `fk_post` (`postId`),
  ADD KEY `fk_message` (`messageId`);

--
-- 資料表索引 `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notificationId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `postId` (`postId`);

--
-- 資料表索引 `pinContent`
--
ALTER TABLE `pinContent`
  ADD PRIMARY KEY (`pinContentId`),
  ADD KEY `adminId` (`adminId`),
  ADD KEY `postId` (`postId`);

--
-- 資料表索引 `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`postId`),
  ADD KEY `userId_FK` (`userId`) USING BTREE,
  ADD KEY `categoryId_FK` (`categoryId`) USING BTREE;

--
-- 資料表索引 `punishments`
--
ALTER TABLE `punishments`
  ADD PRIMARY KEY (`punishmentId`),
  ADD KEY `punishments_user_fk` (`userId`),
  ADD KEY `punishments_admin_fk` (`adminId`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `adminUsers`
--
ALTER TABLE `adminUsers`
  MODIFY `adminId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `calendar_tasks`
--
ALTER TABLE `calendar_tasks`
  MODIFY `taskId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `category`
--
ALTER TABLE `category`
  MODIFY `categoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedbackId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `media`
--
ALTER TABLE `media`
  MODIFY `mediaId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notificationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `pinContent`
--
ALTER TABLE `pinContent`
  MODIFY `pinContentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `posts`
--
ALTER TABLE `posts`
  MODIFY `postId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `punishments`
--
ALTER TABLE `punishments`
  MODIFY `punishmentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20009;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `adminUsers`
--
ALTER TABLE `adminUsers`
  ADD CONSTRAINT `adminusers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- 資料表的限制式 `calendar_tasks`
--
ALTER TABLE `calendar_tasks`
  ADD CONSTRAINT `calendar_tasks_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- 資料表的限制式 `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_3` FOREIGN KEY (`messageId`,`postId`) REFERENCES `messages` (`messageId`, `postId`) ON DELETE CASCADE;

--
-- 資料表的限制式 `media`
--
ALTER TABLE `media`
  ADD CONSTRAINT `media_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `media_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`) ON DELETE CASCADE,
  ADD CONSTRAINT `media_ibfk_3` FOREIGN KEY (`messageId`,`postId`) REFERENCES `messages` (`messageId`, `postId`) ON DELETE CASCADE;

--
-- 資料表的限制式 `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`) ON DELETE CASCADE;

--
-- 資料表的限制式 `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD CONSTRAINT `fk_message` FOREIGN KEY (`messageId`) REFERENCES `messages` (`messageId`),
  ADD CONSTRAINT `fk_post` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- 資料表的限制式 `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`) ON DELETE CASCADE;

--
-- 資料表的限制式 `pinContent`
--
ALTER TABLE `pinContent`
  ADD CONSTRAINT `pincontent_ibfk_1` FOREIGN KEY (`adminId`) REFERENCES `adminUsers` (`adminId`),
  ADD CONSTRAINT `pincontent_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`postId`);

--
-- 資料表的限制式 `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `category` (`categoryId`) ON DELETE CASCADE;

--
-- 資料表的限制式 `punishments`
--
ALTER TABLE `punishments`
  ADD CONSTRAINT `punishments_admin_fk` FOREIGN KEY (`adminId`) REFERENCES `adminUsers` (`adminId`),
  ADD CONSTRAINT `punishments_user_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
