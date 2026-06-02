-- Commission pricing tiers
-- Managed by scripts/admin/pricing.html via scripts/admin-server.mjs
-- 14 rows

INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('doodle', 'art', 'Doodle', 'Starting at $10', 'Quick little doodle of varying quality.', 'Starting at $8', 'Pride Month Sale - 20% OFF!', 1, 0);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('sketch', 'art', 'Sketch', 'Starting at $20', 'Rough sketch. Can choose if it''s colored or not.', 'Starting at $16', 'Pride Month Sale - 20% OFF!', 1, 1);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('flat-color', 'art', 'Flat Color', 'Starting at $40', 'Clean lines with color.', 'Starting at $32', 'Pride Month Sale - 20% OFF!', 1, 2);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('shaded', 'art', 'Shaded', 'Starting at $60', 'Clean lines with color and either flat or basic smooth shading.', 'Starting at $48', 'Pride Month Sale - 20% OFF!', 1, 3);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('rendered', 'art', 'Rendered', 'Starting at $90', 'Fully rendered piece.', 'Starting at $72', 'Pride Month Sale - 20% OFF!', 1, 4);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('emote', 'art', 'Emote', '$20 per emote', 'Either flat color or flat shaded.
Usually exported at 2x required resolution.
(256x256 for Discord, 224x224 for Twitch)', '$16 per emote', 'Pride Month Sale - 20% OFF!', 1, 5);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('sticker', 'art', 'Sticker', '$30 per sticker', 'Either flat color or flat shaded.
Exported in 512x512 pixels in either WEBP or PNG format.
Animated stickers are always exported in APNG format.', '$24 per sticker', 'Pride Month Sale - 20% OFF!', 1, 6);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('icon', 'art', 'Icon', '$40', 'Headshot with optional shading.
Can export in any resolution as long as its square.', '$32', 'Pride Month Sale - 20% OFF!', 1, 7);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('badge', 'art', 'Badge', '$50', 'Halfbody with optional shading.
Can be shipped from the US*.
Optionally, if there''s an upcoming convention, I can try to do at-con pickup.
Or you can just print it yourself. I recommend going to Office Depot for this.', '$40', 'Pride Month Sale - 20% OFF!', 1, 8);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('png-tuber', 'art', 'PNG-Tuber', 'Starting at $60', 'Comes with 2 sprites by default, talking and neutral. Blink sprites optional.
Additional outfits or expressions are available*.', 'Starting at $48', 'Pride Month Sale - 20% OFF!', 1, 9);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('reference', 'art', 'Reference', 'Starting at $100', 'Full reference sheet with front view, back view, side info, and expression sheet.
Fully custom designs are also available*.', 'Starting at $80', 'Pride Month Sale - 20% OFF!', 1, 10);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('music', 'audio', 'Music Composition', 'Starting at $250', 'Original instrumental composition for streams, videos, or games.
Mixing/mastering included.', 'Starting at $200', 'Pride Month Sale - 20% OFF!', 1, 100);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('sound-design', 'audio', 'Sound Design', 'Starting at $50', 'Sound design for anything, whether that be video game sounds, scenes, etc.
Pricing depends on complexity/length.', 'Starting at $40', 'Pride Month Sale - 20% OFF!', 1, 150);
INSERT INTO commission_pricing (id, category, label, price, details, sale_price, sale_label, is_active, sort_order) VALUES ('voice-acting', 'audio', 'Voice Acting', 'Starting at $20 per line', 'Voice-over or character lines.
Voices that put strain on my voice may incur extra fees.', 'Starting at $16 per line', 'Pride Month Sale - 20% OFF!', 1, 200);
