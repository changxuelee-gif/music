-- =============================================================
-- 声屿音乐导航 - MySQL 8.0 建表脚本
-- 合规说明：本库仅存储「导航元数据」，不存储任何音频、歌词、音源文件
-- 字符集统一 utf8mb4，时间统一东八区
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `fenghuang_music`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fenghuang_music`;

-- -------------------------------------------------------------
-- 1. 用户表：后台管理员/审核员 + 前台可选登录用户
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username`      VARCHAR(50)  NOT NULL COMMENT '登录名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt 密码哈希',
  `nickname`      VARCHAR(50)  DEFAULT NULL COMMENT '昵称',
  `avatar`        VARCHAR(500) DEFAULT NULL COMMENT '头像地址',
  `role`          ENUM('admin','reviewer','user') NOT NULL DEFAULT 'user' COMMENT 'admin=管理员 reviewer=审核员 user=普通用户',
  `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  `last_login_at` DATETIME     DEFAULT NULL COMMENT '最近登录时间',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role_status` (`role`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户/管理员';

-- -------------------------------------------------------------
-- 2. 分类表：风格 style / 场景 scene / 语种 language
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(50)  NOT NULL COMMENT '分类名称',
  `slug`       VARCHAR(80)  NOT NULL COMMENT 'URL 标识，如 guofeng',
  `type`       ENUM('style','scene','language') NOT NULL DEFAULT 'style' COMMENT '分类维度',
  `icon`       VARCHAR(200) DEFAULT NULL COMMENT '图标（emoji 或图片地址）',
  `color`      VARCHAR(20)  DEFAULT NULL COMMENT '主题色，如 #7C5CFF',
  `intro`      VARCHAR(255) DEFAULT NULL COMMENT '一句话介绍',
  `sort`       INT          NOT NULL DEFAULT 0 COMMENT '排序，越小越前',
  `status`     TINYINT      NOT NULL DEFAULT 1 COMMENT '1启用 0停用',
  `seo_title`  VARCHAR(200) DEFAULT NULL,
  `seo_desc`   VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_slug` (`type`,`slug`),
  KEY `idx_type_status_sort` (`type`,`status`,`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类（风格/场景/语种）';

-- -------------------------------------------------------------
-- 3. 标签表
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(30)  NOT NULL,
  `slug`       VARCHAR(50)  NOT NULL,
  `type`       ENUM('style','scene','mood','language','other') NOT NULL DEFAULT 'mood',
  `color`      VARCHAR(20)  DEFAULT NULL,
  `sort`       INT          NOT NULL DEFAULT 0,
  `status`     TINYINT      NOT NULL DEFAULT 1,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_status_sort` (`status`,`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签';

-- -------------------------------------------------------------
-- 4. 音乐人表：official_url 必须命中正版平台白名单
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `artists`;
CREATE TABLE `artists` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(80)  NOT NULL COMMENT '音乐人名称',
  `slug`         VARCHAR(100) NOT NULL COMMENT 'URL 标识',
  `avatar`       VARCHAR(500) DEFAULT NULL,
  `country`      VARCHAR(30)  DEFAULT NULL COMMENT '国家/地区',
  `genre`        VARCHAR(60)  DEFAULT NULL COMMENT '主要风格',
  `platform`     VARCHAR(30)  DEFAULT NULL COMMENT '主要平台标识 qq/netease/kugou/qishui/kuwo/migu',
  `official_url` VARCHAR(500) NOT NULL COMMENT '正版平台官方主页（白名单校验）',
  `bio`          TEXT         COMMENT '简介（纯文本，最多 500 字）',
  `is_hot`       TINYINT      NOT NULL DEFAULT 0,
  `sort`         INT          NOT NULL DEFAULT 0,
  `status`       TINYINT      NOT NULL DEFAULT 1 COMMENT '1正常 0下架',
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_status_sort` (`status`,`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音乐人导航';

-- -------------------------------------------------------------
-- 5. 歌单表
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `playlists`;
CREATE TABLE `playlists` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(100) NOT NULL COMMENT '歌单标题',
  `slug`          VARCHAR(120) NOT NULL COMMENT 'URL 标识',
  `cover`         VARCHAR(500) DEFAULT NULL COMMENT '封面图',
  `summary`       VARCHAR(255) DEFAULT NULL COMMENT '一句话简介',
  `description`   TEXT         COMMENT '详细介绍（纯文本）',
  `category_id`   INT UNSIGNED DEFAULT NULL COMMENT '风格分类',
  `scene_id`      INT UNSIGNED DEFAULT NULL COMMENT '场景分类',
  `language_id`   INT UNSIGNED DEFAULT NULL COMMENT '语种分类',
  `curator`       VARCHAR(50)  DEFAULT '声屿编辑部' COMMENT '人工策展人',
  `song_count`    INT          NOT NULL DEFAULT 0 COMMENT '歌曲数（保存歌曲时自动维护）',
  `view_count`    INT          NOT NULL DEFAULT 0 COMMENT '详情页浏览量',
  `click_count`   INT          NOT NULL DEFAULT 0 COMMENT '去收听点击数',
  `favorite_count` INT         NOT NULL DEFAULT 0 COMMENT '收藏数',
  `is_featured`   TINYINT      NOT NULL DEFAULT 0 COMMENT '精选推荐',
  `is_hot`        TINYINT      NOT NULL DEFAULT 0 COMMENT '热门榜单',
  `is_new`        TINYINT      NOT NULL DEFAULT 1 COMMENT '新收录',
  `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '1已上架 0已下架',
  `sort`          INT          NOT NULL DEFAULT 0,
  `seo_title`     VARCHAR(200) DEFAULT NULL,
  `seo_keywords`  VARCHAR(200) DEFAULT NULL,
  `seo_desc`      VARCHAR(500) DEFAULT NULL,
  `created_by`    INT UNSIGNED DEFAULT NULL,
  `published_at`  DATETIME     DEFAULT NULL COMMENT '上架时间',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_status_sort` (`status`,`sort`,`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_scene` (`scene_id`),
  KEY `idx_language` (`language_id`),
  KEY `idx_featured` (`is_featured`,`status`),
  KEY `idx_hot` (`is_hot`,`status`),
  CONSTRAINT `fk_playlist_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_playlist_scene` FOREIGN KEY (`scene_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_playlist_language` FOREIGN KEY (`language_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人工策展歌单';

-- -------------------------------------------------------------
-- 6. 歌曲表：仅保存元数据 + 正版平台跳转链接
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `songs`;
CREATE TABLE `songs` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `playlist_id` INT UNSIGNED NOT NULL,
  `title`       VARCHAR(120) NOT NULL COMMENT '歌曲名',
  `artist_name` VARCHAR(120) NOT NULL COMMENT '歌手名',
  `artist_id`   INT UNSIGNED DEFAULT NULL COMMENT '关联音乐人（可选）',
  `platform`    ENUM('qq','netease','kugou','qishui','kuwo','migu') NOT NULL DEFAULT 'qq' COMMENT '正版平台',
  `url`         VARCHAR(500) NOT NULL COMMENT '正版平台歌曲页链接（白名单校验，禁止音源）',
  `cover`       VARCHAR(500) DEFAULT NULL COMMENT '歌曲封面（可选）',
  `duration`    VARCHAR(10)  DEFAULT NULL COMMENT '时长展示，如 04:12',
  `sort`        INT          NOT NULL DEFAULT 0,
  `status`      TINYINT      NOT NULL DEFAULT 1,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_playlist_sort` (`playlist_id`,`sort`),
  KEY `idx_platform` (`platform`),
  CONSTRAINT `fk_song_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_song_artist` FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='歌曲导航条目（不含音频）';

-- -------------------------------------------------------------
-- 7. 歌单-标签 多对多
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `playlist_tags`;
CREATE TABLE `playlist_tags` (
  `playlist_id` INT UNSIGNED NOT NULL,
  `tag_id`      INT UNSIGNED NOT NULL,
  PRIMARY KEY (`playlist_id`,`tag_id`),
  KEY `idx_tag` (`tag_id`),
  CONSTRAINT `fk_pt_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='歌单标签关联';

-- -------------------------------------------------------------
-- 8. 首页 Banner / 专题
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`      VARCHAR(100) NOT NULL,
  `subtitle`   VARCHAR(200) DEFAULT NULL,
  `badge`      VARCHAR(30)  DEFAULT NULL COMMENT '角标，如「本周专题」',
  `image`      VARCHAR(500) DEFAULT NULL COMMENT '主视觉图',
  `theme`      VARCHAR(20)  DEFAULT 'indigo' COMMENT '视觉主题 indigo/violet/gold',
  `link_type`  ENUM('playlist','artist','category','none') NOT NULL DEFAULT 'none',
  `link_value` VARCHAR(120) DEFAULT NULL COMMENT '对应 slug',
  `position`   ENUM('home_hero','home_middle') NOT NULL DEFAULT 'home_hero',
  `sort`       INT          NOT NULL DEFAULT 0,
  `status`     TINYINT      NOT NULL DEFAULT 1,
  `start_at`   DATETIME     DEFAULT NULL,
  `end_at`     DATETIME     DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_position_status_sort` (`position`,`status`,`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='首页轮播/专题';

-- -------------------------------------------------------------
-- 9. 版权投诉工单
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_no`    VARCHAR(32)  NOT NULL COMMENT '工单号 CP2026xxxxxx',
  `name`         VARCHAR(50)  NOT NULL COMMENT '投诉人姓名/单位',
  `contact`      VARCHAR(100) NOT NULL COMMENT '联系方式（手机/邮箱）',
  `type`         ENUM('copyright','info','link','other') NOT NULL DEFAULT 'copyright' COMMENT '投诉类型',
  `target_url`   VARCHAR(500) DEFAULT NULL COMMENT '涉嫌侵权链接',
  `description`  TEXT         NOT NULL COMMENT '投诉说明',
  `evidence_url` VARCHAR(500) DEFAULT NULL COMMENT '权属材料地址（图片/PDF）',
  `status`       ENUM('pending','processing','done','rejected') NOT NULL DEFAULT 'pending',
  `reply`        TEXT         COMMENT '处理回复',
  `handler_id`   INT UNSIGNED DEFAULT NULL,
  `ip`           VARCHAR(45)  DEFAULT NULL,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `handled_at`   DATETIME     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ticket_no` (`ticket_no`),
  KEY `idx_status_created` (`status`,`created_at`),
  CONSTRAINT `fk_complaint_handler` FOREIGN KEY (`handler_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='版权投诉工单';

-- -------------------------------------------------------------
-- 10. 用户收藏（游客不可用，登录后可用）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED NOT NULL,
  `target_type` ENUM('playlist','artist') NOT NULL,
  `target_id`   INT UNSIGNED NOT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`,`target_type`,`target_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏';

-- -------------------------------------------------------------
-- 11. 站点配置（SEO / 资质 / 免责声明）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `site_config`;
CREATE TABLE `site_config` (
  `config_key`  VARCHAR(60) NOT NULL,
  `config_value` TEXT       COMMENT '文本或 JSON 字符串',
  `description` VARCHAR(200) DEFAULT NULL,
  `updated_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点配置';

-- -------------------------------------------------------------
-- 12. 搜索日志（用于热门搜索词看板）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `search_logs`;
CREATE TABLE `search_logs` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `keyword`      VARCHAR(80) NOT NULL,
  `result_count` INT         NOT NULL DEFAULT 0,
  `ip`           VARCHAR(45) DEFAULT NULL,
  `created_at`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_keyword_created` (`keyword`,`created_at`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索日志';

-- -------------------------------------------------------------
-- 13. 访问埋点
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `visit_logs`;
CREATE TABLE `visit_logs` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `path`       VARCHAR(200) NOT NULL,
  `referer`    VARCHAR(500) DEFAULT NULL,
  `ua`         VARCHAR(300) DEFAULT NULL,
  `ip`         VARCHAR(45)  DEFAULT NULL,
  `visitor_id` VARCHAR(64)  DEFAULT NULL COMMENT '前端本地生成的匿名访客 ID',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_path` (`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='PV/UV 埋点';

-- -------------------------------------------------------------
-- 14. 歌曲跳转点击（去收听统计）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `song_clicks`;
CREATE TABLE `song_clicks` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `song_id`     INT UNSIGNED NOT NULL,
  `playlist_id` INT UNSIGNED NOT NULL,
  `platform`    VARCHAR(20)  NOT NULL,
  `ip`          VARCHAR(45)  DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_playlist_created` (`playlist_id`,`created_at`),
  KEY `idx_song` (`song_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='去收听点击统计';

SET FOREIGN_KEY_CHECKS = 1;
