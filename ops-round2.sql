-- ============================================
-- 声屿音乐导航 · 全方位运营 SQL（2026-11-10）
-- 作用：补摇滚/嘻哈歌单、打精选/热门/新收录标记、调整轮播专题
-- ============================================

-- 1. 先查一下分类表，确认摇滚/嘻哈的 category_id（先跑这个看结果）
-- SELECT id, name, slug FROM categories;

-- 假设分类 id：1=国风 2=流行 3=电子 4=民谣 5=摇滚 6=爵士 7=古典 8=嘻哈
-- 如果上面查询结果 id 不同，下面 SQL 里的 category_id 要对应改

-- 2. 新增 2 个摇滚歌单
INSERT INTO playlists (title, slug, cover, summary, description, category_id, curator, seo_title, seo_keywords, seo_desc, is_featured, is_hot, is_new, status, sort) VALUES
('无地自容·摇滚不灭', 'rock-classic', '/images/covers/cover-rock.svg',
 '失真吉他与嘶吼的现场，热血永不冷却。',
 '从经典摇滚到独立之声，用吉他墙点燃每个躁动的夜晚。',
 5, '声屿编辑部',
 '摇滚经典歌单 - 声屿音乐导航', '摇滚,经典摇滚,独立摇滚,吉他',
 '精选中外摇滚经典，失真吉他与现场嘶吼，热血永不冷却。',
 1, 1, 1, 1, 10),
('公路狂飙·驾驶摇滚', 'road-trip-rock', '/images/covers/cover-rock2.svg',
 '车窗摇下，油门踩到底，摇滚公路歌单。',
 '适合长途驾驶的摇滚精选，节奏强劲，一路向前。',
 5, '声屿编辑部',
 '公路驾驶摇滚歌单 - 声屿音乐导航', '公路音乐,驾驶歌单,摇滚',
 '适合长途驾驶的摇滚精选，节奏强劲，一路向前。',
 1, 0, 1, 1, 20);

-- 3. 新增 2 个嘻哈歌单
INSERT INTO playlists (title, slug, cover, summary, description, category_id, curator, seo_title, seo_keywords, seo_desc, is_featured, is_hot, is_new, status, sort) VALUES
('街头节拍·华语嘻哈', 'cn-hiphop', '/images/covers/cover-hiphop.svg',
 '中国新说唱之后，华语街头的节奏与态度。',
 '精选华语嘻哈热门曲目，flow 与 punchline 的双重享受。',
 8, '声屿编辑部',
 '华语嘻哈歌单 - 声屿音乐导航', '嘻哈,说唱,中文说唱,hiphop',
 '精选华语嘻哈热门曲目，flow 与 punchline 的双重享受。',
 1, 1, 1, 1, 10),
('黄金年代·Old School', 'old-school-rap', '/images/covers/cover-hiphop2.svg',
 '回到90年代，boom bap 与采样的黄金年代。',
 '嘻哈起源时期的经典之作，采样与节奏的纯粹魅力。',
 8, '声屿编辑部',
 'Old School 嘻哈经典 - 声屿音乐导航', 'old school,嘻哈,经典说唱',
 '嘻哈起源时期的经典之作，采样与节奏的纯粹魅力。',
 0, 0, 0, 1, 20);

-- 4. 给现有歌单打标记（精选推荐区要 6 个，热门要排前面，新收录要刚加的）
UPDATE playlists SET is_featured=1, is_hot=1, sort=1 WHERE slug='guofeng-shanhe';
UPDATE playlists SET is_featured=1, is_hot=1, sort=2 WHERE slug='midnight-city';
UPDATE playlists SET is_featured=1, is_hot=0, sort=3 WHERE slug='focus-flow';
UPDATE playlists SET is_featured=1, is_hot=0, sort=4 WHERE slug='folk-faraway';
UPDATE playlists SET is_featured=1, is_hot=0, sort=5 WHERE slug='cafe-jazz';
UPDATE playlists SET is_featured=1, is_hot=1, sort=6 WHERE slug='pop-private';
UPDATE playlists SET is_featured=1, is_hot=0, sort=7 WHERE slug='workout-beat';
UPDATE playlists SET is_featured=1, is_hot=0, sort=8 WHERE slug='cinema-score';

-- 5. 新收录区：刚加的 4 个新歌单打上 is_new=1
-- （上面 INSERT 已经带了 is_new=1，这里确认一下）

-- 6. 给新摇滚歌单加歌曲
INSERT INTO songs (playlist_id, title, artist_name, platform, url, sort, status) VALUES
((SELECT id FROM playlists WHERE slug='rock-classic' LIMIT 1), '无地自容', '黑豹乐队', 'qq', 'https://y.qq.com/n/ryqq/search?w=无地自容 黑豹', 1, 1),
((SELECT id FROM playlists WHERE slug='rock-classic' LIMIT 1), '梦回唐朝', '唐朝乐队', 'qq', 'https://y.qq.com/n/ryqq/search?w=梦回唐朝 唐朝乐队', 2, 1),
((SELECT id FROM playlists WHERE slug='rock-classic' LIMIT 1), '再见杰克', '痛仰乐队', 'qq', 'https://y.qq.com/n/ryqq/search?w=再见杰克 痛仰', 3, 1),
((SELECT id FROM playlists WHERE slug='rock-classic' LIMIT 1), '向阳花', '谢天笑', 'qq', 'https://y.qq.com/n/ryqq/search?w=向阳花 谢天笑', 4, 1),
((SELECT id FROM playlists WHERE slug='rock-classic' LIMIT 1), '光辉岁月', 'Beyond', 'qq', 'https://y.qq.com/n/ryqq/search?w=光辉岁月 Beyond', 5, 1),
((SELECT id FROM playlists WHERE slug='road-trip-rock' LIMIT 1), '公路之歌', '痛仰乐队', 'qq', 'https://y.qq.com/n/ryqq/search?w=公路之歌 痛仰', 1, 1),
((SELECT id FROM playlists WHERE slug='road-trip-rock' LIMIT 1), '曾经的你', '许巍', 'qq', 'https://y.qq.com/n/ryqq/search?w=曾经的你 许巍', 2, 1),
((SELECT id FROM playlists WHERE slug='road-trip-rock' LIMIT 1), '蓝莲花', '许巍', 'qq', 'https://y.qq.com/n/ryqq/search?w=蓝莲花 许巍', 3, 1),
((SELECT id FROM playlists WHERE slug='road-trip-rock' LIMIT 1), '漫步', '许巍', 'qq', 'https://y.qq.com/n/ryqq/search?w=漫步 许巍', 4, 1),
((SELECT id FROM playlists WHERE slug='road-trip-rock' LIMIT 1), '私奔', '郑钧', 'qq', 'https://y.qq.com/n/ryqq/search?w=私奔 郑钧', 5, 1);

-- 7. 给新嘻哈歌单加歌曲
INSERT INTO songs (playlist_id, title, artist_name, platform, url, sort, status) VALUES
((SELECT id FROM playlists WHERE slug='cn-hiphop' LIMIT 1), '星球坠落', '艾热/李佳隆', 'qq', 'https://y.qq.com/n/ryqq/search?w=星球坠落', 1, 1),
((SELECT id FROM playlists WHERE slug='cn-hiphop' LIMIT 1), '目不转睛', '王以太', 'qq', 'https://y.qq.com/n/ryqq/search?w=目不转睛 王以太', 2, 1),
((SELECT id FROM playlists WHERE slug='cn-hiphop' LIMIT 1), '经济舱', 'Kafe.Hu/刘聪', 'qq', 'https://y.qq.com/n/ryqq/search?w=经济舱', 3, 1),
((SELECT id FROM playlists WHERE slug='cn-hiphop' LIMIT 1), '朝天门', 'GAI周延', 'qq', 'https://y.qq.com/n/ryqq/search?w=朝天门 GAI', 4, 1),
((SELECT id FROM playlists WHERE slug='cn-hiphop' LIMIT 1), '灵啊灵啊', '马思唯', 'qq', 'https://y.qq.com/n/ryqq/search?w=灵啊灵啊 马思唯', 5, 1),
((SELECT id FROM playlists WHERE slug='old-school-rap' LIMIT 1), 'Lose Yourself', 'Eminem', 'qq', 'https://y.qq.com/n/ryqq/search?w=Lose Yourself Eminem', 1, 1),
((SELECT id FROM playlists WHERE slug='old-school-rap' LIMIT 1), 'California Love', '2Pac', 'qq', 'https://y.qq.com/n/ryqq/search?w=California Love 2Pac', 2, 1),
((SELECT id FROM playlists WHERE slug='old-school-rap' LIMIT 1), 'Juicy', 'The Notorious B.I.G.', 'qq', 'https://y.qq.com/n/ryqq/search?w=Juicy Biggie', 3, 1),
((SELECT id FROM playlists WHERE slug='old-school-rap' LIMIT 1), 'Rapper\'s Delight', 'The Sugarhill Gang', 'qq', 'https://y.qq.com/n/ryqq/search?w=Rappers Delight', 4, 1),
((SELECT id FROM playlists WHERE slug='old-school-rap' LIMIT 1), 'Straight Outta Compton', 'N.W.A', 'qq', 'https://y.qq.com/n/ryqq/search?w=Straight Outta Compton', 5, 1);

-- 8. 给新摇滚/嘻哈歌单补音乐人
INSERT INTO artists (name, slug, country, genre, platform, official_url, bio, is_hot, sort, status) VALUES
('黑豹乐队', 'black-panther', '中国', '摇滚', 'qq', 'https://y.qq.com/n/ryqq/search?w=黑豹乐队', '中国摇滚传奇，窦鹏/栾树时期经典', 1, 10, 1),
('唐朝乐队', 'tang-dynasty', '中国', '摇滚', 'qq', 'https://y.qq.com/n/ryqq/search?w=唐朝乐队', '中国重金属摇滚奠基者', 1, 11, 1),
('痛仰乐队', 'miserable-beliefs', '中国', '摇滚', 'qq', 'https://y.qq.com/n/ryqq/search?w=痛仰乐队', '中国独立摇滚代表', 1, 12, 1),
('Beyond', 'beyond', '中国香港', '摇滚', 'qq', 'https://y.qq.com/n/ryqq/search?w=Beyond', '华语摇滚不朽传奇', 1, 13, 1),
('许巍', 'xu-wei', '中国', '民谣摇滚', 'qq', 'https://y.qq.com/n/ryqq/search?w=许巍', '蓝莲花般的诗人歌手', 1, 14, 1),
('GAI周延', 'gai', '中国', '嘻哈', 'qq', 'https://y.qq.com/n/ryqq/search?w=GAI周延', '中国新说唱冠军，江湖流代表', 1, 20, 1),
('马思唯', 'ma-siwei', '中国', '嘻哈', 'qq', 'https://y.qq.com/n/ryqq/search?w=马思唯', 'Higher Brothers成员，说唱国际化代表', 0, 21, 1),
('Eminem', 'eminem', '美国', '嘻哈', 'qq', 'https://y.qq.com/n/ryqq/search?w=Eminem', '说唱之神，奥斯卡最佳原创歌曲得主', 1, 22, 1)
ON DUPLICATE KEY UPDATE updated_at=NOW();
