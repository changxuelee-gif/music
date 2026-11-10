-- =============================================================
-- 声屿 - 演示数据（全部人工录入的导航元数据）
-- 说明：歌曲链接均指向正版音乐平台的官方页面，仅用于跳转导航
-- =============================================================
USE `fenghuang_music`;
SET NAMES utf8mb4;

-- 分类：风格
INSERT INTO `categories` (`id`,`name`,`slug`,`type`,`icon`,`color`,`intro`,`sort`,`seo_title`,`seo_desc`) VALUES
(1,'国风','guofeng','style','🏮','#E8C56B','五声音阶里的东方叙事，山河入梦','10','国风歌单导航 - 声屿','精选国风音乐歌单，直达QQ音乐、网易云音乐正版页面'),
(2,'流行','pop','style','🎧','#7C5CFF','当代华语与全球流行的高光切片','20','流行音乐歌单 - 声屿','人工策展流行音乐歌单，发现好音乐'),
(3,'电子','electronic','style','🌌','#5B6CFF','合成器、氛围与城市夜色的电流','30','电子音乐歌单 - 声屿','电子、氛围、轻电子歌单人工精选'),
(4,'民谣','folk','style','🌾','#8FA88B','木吉他与远方，写给生活的注脚','40','民谣歌单 - 声屿','民谣歌单精选，正版平台直达'),
(5,'摇滚','rock','style','🔥','#C2543F','失真吉他里的诚实与热血','50','摇滚歌单 - 声屿','摇滚乐歌单人工策展'),
(6,'爵士','jazz','style','🎷','#C9A227','即兴、铜管与午后的一杯手冲','60','爵士歌单 - 声屿','爵士乐歌单与咖啡馆场景推荐'),
(7,'古典','classical','style','🎻','#9FB3C8','弦乐与钢琴，时间沉淀的声音','70','古典音乐歌单 - 声屿','古典、纯音乐歌单精选'),
(8,'嘻哈','hiphop','style','🎤','#6B7CFF','节奏、押韵与街头的表达欲','80','嘻哈歌单 - 声屿','嘻哈说唱歌单人工策展');

-- 分类：场景
INSERT INTO `categories` (`id`,`name`,`slug`,`type`,`icon`,`color`,`intro`,`sort`,`seo_title`,`seo_desc`) VALUES
(11,'通勤路上','commute','scene','🚇','#5B6CFF','地铁与耳机之间的私人时区','10','通勤BGM歌单 - 声屿','适合通勤、地铁、开车时听的歌单'),
(12,'深夜独处','late-night','scene','🌙','#7C5CFF','城市安静下来之后的声音','20','深夜歌单 - 声屿','深夜独处、睡前放松歌单推荐'),
(13,'专注工作','focus','scene','🧠','#4FA3A5','不打扰的背景声，进入心流','30','专注BGM - 声屿','适合工作、学习、专注的纯音乐歌单'),
(14,'运动燃点','workout','scene','⚡','#D97757','让心率与节拍一起上升','40','运动歌单 - 声屿','跑步、健身、运动BGM歌单'),
(15,'咖啡馆','cafe','scene','☕','#C9A227','午后、窗边与低频爵士','50','咖啡馆歌单 - 声屿','咖啡馆、下午茶场景音乐推荐'),
(16,'影视混剪','video-edit','scene','🎬','#9B6BFF','给短视频创作者的配乐灵感','60','影视混剪BGM - 声屿','短视频、影视混剪配乐歌单');

-- 分类：语种
INSERT INTO `categories` (`id`,`name`,`slug`,`type`,`icon`,`color`,`intro`,`sort`) VALUES
(21,'华语','chinese','language','🇨🇳','#E8C56B','华语流行与独立音乐','10'),
(22,'欧美','western','language','🌍','#5B6CFF','欧美流行、摇滚与电子','20'),
(23,'日韩','jk','language','🌸','#C77DA8','日系与韩系的声音审美','30'),
(24,'纯音乐','instrumental','language','🎹','#9FB3C8','没有人声，只有氛围','40');

-- 标签
INSERT INTO `tags` (`id`,`name`,`slug`,`type`,`color`,`sort`) VALUES
(1,'空灵','kongling','mood','#9B8CFF',10),
(2,'治愈','zhiyu','mood','#8FD3C7',20),
(3,'大气','daqi','mood','#E8C56B',30),
(4,'复古','fugu','mood','#C98F6B',40),
(5,'燃','ran','mood','#E06C5A',50),
(6,'温柔','wenrou','mood','#F0A6C0',60),
(7,'电影感','dianyinggan','mood','#6B7CFF',70),
(8,'轻电子','qingdianzi','style','#5B6CFF',80),
(9,'钢琴','gangqin','style','#9FB3C8',90),
(10,'女声','nvsheng','other','#C77DA8',100),
(11,'男声','nansheng','other','#7C8CA8',110),
(12,'纯音乐','chunyinyue','style','#8FA88B',120),
(13,'国风器乐','guofengqiyue','style','#E8C56B',130),
(14,'氛围','fenwei','mood','#7C5CFF',140),
(15,'城市','chengshi','mood','#5B6CFF',150);

-- 音乐人（official_url 均为正版平台官方页面）
INSERT INTO `artists` (`id`,`name`,`slug`,`avatar`,`country`,`genre`,`platform`,`official_url`,`bio`,`is_hot`,`sort`) VALUES
(1,'周深','zhou-shen','/images/artists/artist-1.svg','中国','流行 / 国风','qq','https://y.qq.com/n/ryqq/search?w=%E5%91%A8%E6%B7%B1','以空灵音色与跨风格驾驭力著称的华语歌手，作品常出现在国风与影视配乐场景。',1,10),
(2,'五月天','mayday','/images/artists/artist-2.svg','中国台湾','摇滚 / 流行','qq','https://y.qq.com/n/ryqq/search?w=%E4%BA%94%E6%9C%88%E5%A4%A9','华语摇滚代表乐团，用现场与旋律记录一代人的青春。',1,20),
(3,'陈粒','chen-li','/images/artists/artist-3.svg','中国','民谣 / 独立','netease','https://music.163.com/#/search/m/?s=%E9%99%88%E7%B2%92','独立音乐人，作品兼具民谣质地与实验气质。',1,30),
(4,'坂本龙一','ryuichi-sakamoto','/images/artists/artist-4.svg','日本','古典 / 电子','netease','https://music.163.com/#/search/m/?s=%E5%9D%82%E6%9C%AC%E9%BE%99%E4%B8%80','作曲家、钢琴家，以极简而深远的聲音美学影响全球。',1,40),
(5,'告五人','accusive','/images/artists/artist-5.svg','中国台湾','流行 / 摇滚','qq','https://y.qq.com/n/ryqq/search?w=%E5%91%8A%E4%BA%94%E4%BA%BA','以旋律与叙事见长的乐团，作品常被用于短视频与影视混剪。',0,50),
(6,'房东的猫','landlord-cat','/images/artists/artist-6.svg','中国','民谣','netease','https://music.163.com/#/search/m/?s=%E6%88%BF%E4%B8%9C%E7%9A%84%E7%8C%AB','清新民谣组合，歌声里有校园与夏天的气息。',0,60),
(7,'梁博','liang-bo','/images/artists/artist-7.svg','中国','摇滚','qq','https://y.qq.com/n/ryqq/search?w=%E6%A2%81%E5%8D%9A','坚持原创与现场质感的摇滚唱作人。',0,70),
(8,'Aurora','aurora','/images/artists/artist-8.svg','挪威','流行 / 民谣','netease','https://music.163.com/#/search/m/?s=Aurora','北欧唱作人，以空灵声线与自然意象构建独特听觉世界。',1,80);

-- 歌单
INSERT INTO `playlists` (`id`,`title`,`slug`,`cover`,`summary`,`description`,`category_id`,`scene_id`,`language_id`,`curator`,`is_featured`,`is_hot`,`is_new`,`sort`,`seo_title`,`seo_keywords`,`seo_desc`) VALUES
(1,'山河入梦 · 国风精选','guofeng-shanhe','/images/covers/cover-1.svg','五声音阶里的东方叙事，适合深夜与雨天。','从器乐到人声，收录近三年在国风场景中被反复提及的作品。所有条目仅提供正版平台跳转，网站本身不存储、不播放任何音频。',1,12,21,'声屿编辑部',1,1,0,10,'山河入梦国风歌单 - 声屿','国风,古风,器乐,华语','国风音乐歌单人工精选，直达正版音乐平台'),
(2,'城市电波 · 深夜通勤','midnight-city','/images/covers/cover-2.svg','地铁、耳机与城市夜色之间的私人时区。','轻电子与氛围音乐组成的通勤陪伴清单，节拍不吵，情绪刚好。',3,11,21,'声屿编辑部',1,1,1,20,'城市电波深夜通勤歌单 - 声屿','通勤,轻电子,氛围,城市','适合通勤与深夜独处的电子氛围歌单'),
(3,'心流时刻 · 钢琴与纯音乐','focus-flow','/images/covers/cover-3.svg','不打扰的背景声，帮助你进入专注状态。','以钢琴、弦乐与极简氛围为主的工作陪伴清单，适合写作、编码与阅读。',7,13,24,'声屿编辑部',1,1,1,30,'专注纯音乐歌单 - 声屿','专注,钢琴,纯音乐,心流','工作学习专注BGM纯音乐歌单'),
(4,'民谣里的远方','folk-faraway','/images/covers/cover-4.svg','木吉他与远方，写给生活的注脚。','从校园民谣到独立创作，收录那些关于城市、故乡与出发的歌。',4,12,21,'声屿编辑部',1,0,1,40,'民谣里的远方歌单 - 声屿','民谣,独立,华语,吉他','华语民谣歌单人工策展'),
(5,'运动燃点 · 电子节拍','workout-beat','/images/covers/cover-5.svg','让心率与节拍一起上升。','为跑步、力量训练准备的高能量电子清单，注意按自身节奏安排训练强度。',3,14,22,'声屿编辑部',0,1,1,50,'运动电子歌单 - 声屿','运动,电子,燃,欧美','跑步健身高能量电子歌单'),
(6,'咖啡馆爵士下午','cafe-jazz','/images/covers/cover-6.svg','午后、窗边与低频铜管。','爵士、Bossa Nova 与轻灵魂乐的下午茶清单，适合咖啡馆与居家放松。',6,15,22,'声屿编辑部',1,0,0,60,'咖啡馆爵士歌单 - 声屿','爵士,咖啡馆,下午茶,欧美','咖啡馆场景爵士歌单推荐'),
(7,'年度私藏 · 华语流行','pop-private','/images/covers/cover-7.svg','不是榜单，是我们真正反复听的十首歌。','编辑部年度私藏，覆盖流行、摇滚与独立，拒绝自动抓取，全部人工试听后录入。',2,11,21,'声屿编辑部',0,1,0,70,'华语流行年度私藏歌单 - 声屿','华语,流行,私藏,年度','华语流行年度私藏歌单'),
(8,'画面之外 · 影视感配乐','cinema-score','/images/covers/cover-8.svg','给短视频与混剪创作者的配乐灵感。','按情绪与画面感整理的配乐清单，使用前请自行确认平台授权范围。',7,16,24,'声屿编辑部',0,0,1,80,'影视混剪配乐歌单 - 声屿','影视,混剪,配乐,纯音乐','短视频影视混剪配乐歌单');

-- 歌单标签
INSERT INTO `playlist_tags` (`playlist_id`,`tag_id`) VALUES
(1,1),(1,3),(1,13),(1,14),
(2,8),(2,15),(2,7),(2,14),
(3,9),(3,12),(3,2),
(4,6),(4,2),(4,10),
(5,5),(5,8),(5,14),
(6,4),(6,14),(6,7),
(7,2),(7,6),(7,11),
(8,7),(8,3),(8,12);

-- 歌曲（仅元数据 + 官方页面链接）
INSERT INTO `songs` (`playlist_id`,`title`,`artist_name`,`artist_id`,`platform`,`url`,`duration`,`sort`) VALUES
(1,'大鱼','周深',1,'qq','https://y.qq.com/n/ryqq/search?w=%E5%A4%A7%E9%B1%BC%20%E5%91%A8%E6%B7%B1','05:08',10),
(1,'左手指月','萨顶顶',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E5%B7%A6%E6%89%8B%E6%8C%87%E6%9C%88','04:34',20),
(1,'琵琶语','林海',NULL,'netease','https://music.163.com/#/search/m/?s=%E7%90%B5%E7%90%B6%E8%AF%AD','04:12',30),
(1,'赤伶','HITA',NULL,'netease','https://music.163.com/#/search/m/?s=%E8%B5%A4%E4%BC%B6','04:24',40),
(1,'兰亭序','周杰伦',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E5%85%B0%E4%BA%AD%E5%BA%8F','04:19',50),

(2,'City of Stars','Ryan Gosling',NULL,'netease','https://music.163.com/#/search/m/?s=City%20of%20Stars','03:59',10),
(2,'夜空中最亮的星','逃跑计划',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E5%A4%9C%E7%A9%BA%E4%B8%AD%E6%9C%80%E4%BA%AE%E7%9A%84%E6%98%9F','04:12',20),
(2,'Intro','The xx',NULL,'netease','https://music.163.com/#/search/m/?s=The%20xx%20Intro','02:08',30),
(2,'光年之外','邓紫棋',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E5%85%89%E5%B9%B4%E4%B9%8B%E5%A4%96','03:55',40),

(3,'Merry Christmas Mr. Lawrence','坂本龙一',4,'netease','https://music.163.com/#/search/m/?s=Merry%20Christmas%20Mr.%20Lawrence','04:38',10),
(3,'River Flows in You','Yiruma',NULL,'qq','https://y.qq.com/n/ryqq/search?w=River%20Flows%20in%20You','03:08',20),
(3,'月光','贝多芬',NULL,'netease','https://music.163.com/#/search/m/?s=%E6%9C%88%E5%85%89%E5%A5%8F%E9%B8%A3%E6%9B%B2','05:20',30),
(3,'Nuvole Bianche','Ludovico Einaudi',NULL,'netease','https://music.163.com/#/search/m/?s=Nuvole%20Bianche','05:57',40),

(4,'理想三旬','陈鸿宇',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E7%90%86%E6%83%B3%E4%B8%89%E6%97%AC','04:20',10),
(4,'云烟成雨','房东的猫',6,'netease','https://music.163.com/#/search/m/?s=%E4%BA%91%E7%83%9F%E6%88%90%E9%9B%A8','04:03',20),
(4,'走马','陈粒',3,'netease','https://music.163.com/#/search/m/?s=%E8%B5%B0%E9%A9%AC%20%E9%99%88%E7%B2%92','03:57',30),
(4,'南方姑娘','赵雷',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E5%8D%97%E6%96%B9%E5%A7%91%E5%A8%98','04:31',40),

(5,'Wake Me Up','Avicii',NULL,'netease','https://music.163.com/#/search/m/?s=Wake%20Me%20Up','04:07',10),
(5,'Blinding Lights','The Weeknd',NULL,'qq','https://y.qq.com/n/ryqq/search?w=Blinding%20Lights','03:20',20),
(5,'Animals','Martin Garrix',NULL,'netease','https://music.163.com/#/search/m/?s=Animals%20Martin%20Garrix','05:03',30),
(5,'Counting Stars','OneRepublic',NULL,'qq','https://y.qq.com/n/ryqq/search?w=Counting%20Stars','04:17',40),

(6,'Fly Me to the Moon','Frank Sinatra',NULL,'netease','https://music.163.com/#/search/m/?s=Fly%20Me%20to%20the%20Moon','02:27',10),
(6,'Autumn Leaves','Bill Evans',NULL,'netease','https://music.163.com/#/search/m/?s=Autumn%20Leaves%20Bill%20Evans','06:30',20),
(6,'The Girl from Ipanema','Stan Getz',NULL,'qq','https://y.qq.com/n/ryqq/search?w=The%20Girl%20from%20Ipanema','05:21',30),

(7,'玫瑰','贰佰',NULL,'netease','https://music.163.com/#/search/m/?s=%E7%8E%AB%E7%91%B0%20%E8%B4%B0%E4%BD%B0','04:54',10),
(7,'小幸运','田馥甄',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E5%B0%8F%E5%B9%B8%E8%BF%90','04:25',20),
(7,'倔强','五月天',2,'qq','https://y.qq.com/n/ryqq/search?w=%E5%80%94%E5%BC%BA%20%E4%BA%94%E6%9C%88%E5%A4%A9','04:20',30),
(7,'出现又离开','梁博',7,'qq','https://y.qq.com/n/ryqq/search?w=%E5%87%BA%E7%8E%B0%E5%8F%88%E7%A6%BB%E5%BC%80','04:53',40),

(8,'Experience','Ludovico Einaudi',NULL,'netease','https://music.163.com/#/search/m/?s=Experience%20Einaudi','05:15',10),
(8,'The Truth','Hans Zimmer',NULL,'netease','https://music.163.com/#/search/m/?s=The%20Truth%20Hans%20Zimmer','04:13',20),
(8,'一生所爱','卢冠廷',NULL,'qq','https://y.qq.com/n/ryqq/search?w=%E4%B8%80%E7%94%9F%E6%89%80%E7%88%B1','04:43',30),
(8,'卡农','帕赫贝尔',NULL,'netease','https://music.163.com/#/search/m/?s=%E5%8D%A1%E5%86%9C','04:37',40);

-- Banner
INSERT INTO `banners` (`id`,`title`,`subtitle`,`badge`,`image`,`theme`,`link_type`,`link_value`,`position`,`sort`,`status`) VALUES
(1,'山河入梦','五声音阶里的东方叙事，听见山水与旧梦。','本周专题','/images/banners/hero-1.svg','indigo','playlist','guofeng-shanhe','home_hero',10,1),
(2,'城市电波','耳机里的深夜时区，给通勤路上的你。','编辑推荐','/images/banners/hero-2.svg','violet','playlist','midnight-city','home_hero',20,1),
(3,'心流时刻','不打扰的背景声，把注意力交还给你。','专注指南','/images/banners/hero-3.svg','gold','playlist','focus-flow','home_hero',30,1);

-- 站点配置：资质信息为合规硬性要求，请勿删除
INSERT INTO `site_config` (`config_key`,`config_value`,`description`) VALUES
('site_name','声屿音乐导航','站点名称'),
('site_slogan','发现好音乐，直达正版音乐平台','站点 Slogan'),
('site_keywords','音乐导航,歌单推荐,正版音乐,音乐发现,声屿','SEO 关键词'),
('site_description','声屿是精品人工音乐导航发现站，按风格、场景、音乐人组织歌单，帮助音乐爱好者与短视频创作者发现好音乐，并直达正版音乐平台。本站不存储、不播放任何音频。','SEO 描述'),
('icp_no','京B2-20213133','ICP 备案号'),
('wenwangwen_no','京网文〔2023〕3019-099号','网络文化经营许可证号'),
('company_name','凤凰爱听（北京）信息技术有限公司','运营主体'),
('complaint_email','copyright.com','版权投诉邮箱'),
('complaint_phone','010-8888 6666','版权投诉电话'),
('disclaimer','本站为音乐导航网站，仅提供正版音乐平台官方页面的跳转服务，不存储、不播放、不提供任何音频、歌词或音源文件。本站歌单、歌曲与音乐人信息均由编辑人工整理录入，版权归原权利人所有。如权利人认为本站收录信息侵犯其合法权益，可通过版权投诉入口提交权属材料，我们将在收到有效通知后依法处理。','免责声明'),
('privacy_policy','我们仅收集维持网站运行所必需的最小信息：访问日志（IP、浏览器标识、访问路径）用于安全与统计分析；投诉表单中的姓名、联系方式与权属材料仅用于处理版权投诉。我们不会向第三方出售或出租个人信息。您可通过版权投诉邮箱联系我们，行使查询、更正与删除权利。','隐私政策'),
('hot_search_words','国风,深夜,纯音乐,民谣,通勤,周深','热门搜索词（逗号分隔，用于搜索页展示）'),
('analytics_code','','三方统计代码（直接粘贴 Google Analytics / 百度统计等完整 script 标签，留空则不启用）');

-- 依据实际曲目回填歌单曲目数（后台列表与统计依赖该字段）
UPDATE `playlists` p
SET p.`song_count` = (
  SELECT COUNT(*) FROM `songs` s WHERE s.`playlist_id` = p.`id` AND s.`status` = 1
);

-- 演示用历史统计数据（便于看板展示）
INSERT INTO `visit_logs` (`path`,`ua`,`ip`,`visitor_id`,`created_at`) VALUES
('/','Mozilla/5.0','127.0.0.1','demo-visitor-1',NOW() - INTERVAL 1 DAY),
('/playlist/guofeng-shanhe','Mozilla/5.0','127.0.0.1','demo-visitor-1',NOW() - INTERVAL 1 DAY),
('/category/guofeng','Mozilla/5.0','127.0.0.1','demo-visitor-2',NOW() - INTERVAL 2 DAY);

INSERT INTO `search_logs` (`keyword`,`result_count`,`ip`,`created_at`) VALUES
('国风',4,'127.0.0.1',NOW() - INTERVAL 1 DAY),
('深夜',3,'127.0.0.1',NOW() - INTERVAL 1 DAY),
('纯音乐',5,'127.0.0.1',NOW() - INTERVAL 2 DAY);

INSERT INTO `song_clicks` (`song_id`,`playlist_id`,`platform`,`ip`,`created_at`) VALUES
(1,1,'qq','127.0.0.1',NOW() - INTERVAL 1 DAY),
(6,2,'netease','127.0.0.1',NOW() - INTERVAL 1 DAY);
