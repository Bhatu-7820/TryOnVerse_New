require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Auction = require('./models/Auction');
const Banner = require('./models/Banner');
const BodyScan = require('./models/BodyScan');
const Design = require('./models/Design');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://Bhatu:erqjVHEs1Nfp7IYh@cluster0.dnz39u3.mongodb.net/tryonverse?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri}`);

    // 1. Seed Users (Admin & Test Customer)
    let admin = await User.findOne({ email: 'admin@tryonverse.com' });
    if (!admin) {
      admin = await User.create({
        name: 'TryOnVerse Administrator',
        email: 'admin@tryonverse.com',
        password: 'AdminPassword123!',
        role: 'admin',
        phone: '+91 9876543210',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        addresses: [{
          fullName: 'TryOnVerse HQ',
          phone: '+91 9876543210',
          street: '100 Fashion Avenue, Cyber City',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          isDefault: true
        }]
      });
      console.log('✅ Admin user created: admin@tryonverse.com / AdminPassword123!');
    }

    let customer = await User.findOne({ email: 'alex@tryonverse.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Alex Vance',
        email: 'alex@tryonverse.com',
        password: 'UserPassword123!',
        role: 'user',
        phone: '+91 9123456789',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        addresses: [{
          fullName: 'Alex Vance',
          phone: '+91 9123456789',
          street: '42 Designer Boulevard, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400050',
          country: 'India',
          isDefault: true
        }]
      });
      console.log('✅ Customer user created: alex@tryonverse.com / UserPassword123!');
    }

    // 2. Seed 10 Fashion Categories
    await Category.deleteMany({});
    const categoriesData = [
      {
        name: 'Men',
        slug: 'men',
        description: 'Everyday essentials, sharp tailoring, casual wear, and premium outerwear for men.',
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Women',
        slug: 'women',
        description: 'Contemporary womenswear, elegant dresses, kurtas, denim, and tops.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Kids',
        slug: 'kids',
        description: 'Comfortable, durable, and playful fashion for boys and girls.',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'T-Shirts & Polos',
        slug: 't-shirts',
        description: 'Graphic tees, minimal solids, polo collars, and relaxed drop-shoulder silhouettes.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Shirts',
        slug: 'shirts',
        description: 'Casual button-downs, crisp formal shirts, resort Cuban collars, and pure linen shirts.',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Dresses & Kurtas',
        slug: 'dresses',
        description: 'Floral day dresses, evening slips, A-line silhouettes, and festive Indian ethnic kurtas.',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Jeans & Trousers',
        slug: 'jeans',
        description: 'Slim, regular, and relaxed denim washes, pleated chinos, and smart tailored trousers.',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Jackets & Coats',
        slug: 'jackets',
        description: 'Bomber jackets, wool trenchcoats, biker leathers, and casual denim truckers.',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Hoodies & Sweaters',
        slug: 'hoodies',
        description: 'Heavyweight organic cotton hoodies, fleece pullovers, and knit crewnecks.',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Shoes & Accessories',
        slug: 'shoes-accessories',
        description: 'Retro sneakers, casual loafers, leather bags, belts, and classic watches.',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
      }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Seeded ${createdCategories.length} categories.`);

    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 3. Generate 180+ Realistic Unique Products
    await Product.deleteMany({});

    // Curated high quality fashion apparel image pools (4:5 ratio)
    const imagesPool = {
      menShirts: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80'
      ],
      menTshirts: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
      ],
      menJeans: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=800&q=80'
      ],
      menJackets: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=800&q=80'
      ],
      menHoodies: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
      ],
      womenDresses: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80'
      ],
      womenTops: [
        'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80'
      ],
      womenJeans: [
        'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80'
      ],
      womenJackets: [
        'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80'
      ],
      kidsClothing: [
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'
      ],
      accessories: [
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80'
      ]
    };

    const brands = [
      'Roadster',
      'HRX by Hrithik',
      'Mast & Harbour',
      'HERE&NOW',
      'WROGN',
      'Tokyo Talkies',
      'DressBerry',
      'Campus Sutra',
      'Nautica',
      'Highlander',
      'Dennis Lingo',
      'U.S. Polo Assn.',
      'Levis',
      'Snitch',
      'Allen Solly',
      'Van Heusen',
      'Anouk',
      'Libas',
      'Flying Machine',
      'Max Fashion'
    ];

    const allProducts = [];

    // Generator helper for rich product instances
    let pCounter = 1;

    function buildProduct({
      name,
      brand,
      categorySlug,
      gender,
      subCategory,
      mrp,
      salePrice,
      rating,
      reviewsCount,
      image,
      secondaryImage = null,
      tryOnType,
      material,
      fit,
      sizes = ['S', 'M', 'L', 'XL'],
      colors = [
        { name: 'Pitch Black', hex: '#111111' },
        { name: 'Pure White', hex: '#FFFFFF' }
      ],
      description,
      featured = false
    }) {
      const discount = Math.round(((mrp - salePrice) / mrp) * 100);
      const images = secondaryImage && secondaryImage !== image
        ? [image, secondaryImage]
        : [image];
      return {
        name,
        brand: brand || brands[pCounter % brands.length],
        category: catMap[categorySlug] || catMap['men'],
        gender,
        subCategory,
        price: mrp, // MRP strikethrough price
        salePrice,  // Current checkout selling price
        discount,
        rating: Number(rating.toFixed(1)),
        reviewsCount,
        images,
        sizes,
        colors,
        stock: Math.floor(Math.random() * 40) + 10,
        featured,
        tryOnType: tryOnType || 'tshirt',
        material: material || '100% Breathable Combed Cotton',
        fit: fit || 'Regular Fit',
        tags: [gender, subCategory, fit || 'Regular Fit', 'Season 2026'],
        description:
          description ||
          `Crafted from premium ${material || 'cotton fabric'} with durable stitching. Features a ${fit || 'modern fit'} designed for all-day comfort and effortless styling.`
      };
    }

    // ==========================================
    // SECTION A: MEN'S COLLECTION (~75 products)
    // ==========================================

    // A1: Men's Shirts (20 items)
    const menShirtsNames = [
      'Pure Linen Slim Fit Casual Shirt',
      'Oxford Cotton Button-Down Shirt',
      'Cuban Collar Resort Striped Shirt',
      'Tartan Plaid Flannel Casual Shirt',
      'Mandarin Collar Chambray Shirt',
      'Textured Waffle Weave Shirt',
      'Monochrome Minimalist Poplin Shirt',
      'Pastel Peach Linen Casual Shirt',
      'Navy Dobby Weave Formal Shirt',
      'Drop Shoulder Camp Collar Shirt',
      'Denim Washed Button-Down Shirt',
      'Vintage Corduroy Overshirt',
      'Seersucker Breathable Summer Shirt',
      'Windowpane Check Tailored Shirt',
      'Sage Green Pure Cotton Shirt',
      'Indigo Indigo Dyed Casual Shirt',
      'Classic White Easy-Iron Formal Shirt',
      'Khaki Utility Double Pocket Shirt',
      'Striped Relaxed Fit Bowling Shirt',
      'French Cuff Luxury Poplin Shirt'
    ];

    menShirtsNames.forEach((name, i) => {
      const mrp = 1499 + (i % 6) * 300;
      const sale = Math.round(mrp * (0.45 + (i % 4) * 0.08));
      allProducts.push(
        buildProduct({
          name,
          brand: brands[i % brands.length],
          categorySlug: 'shirts',
          gender: 'Men',
          subCategory: 'Shirts',
          mrp,
          salePrice: sale,
          rating: 4.1 + (i % 8) * 0.1,
          reviewsCount: 45 + i * 18,
          image: imagesPool.menShirts[i % imagesPool.menShirts.length],
          tryOnType: 'jacket',
          material: i % 2 === 0 ? '100% Pure Linen' : '100% Combed Cotton',
          fit: i % 3 === 0 ? 'Slim Fit' : 'Regular Fit',
          featured: i < 3
        })
      );
      pCounter++;
    });

    // A2: Men's T-Shirts (20 items)
    const menTshirtNames = [
      'Heavyweight 240 GSM Boxy Tee',
      'Vintage Wash Graphic Print T-Shirt',
      'Pima Cotton Minimalist Crew Neck',
      'Waffle Knit Texture Drop-Shoulder Tee',
      'Polo Collar Cotton Pique T-Shirt',
      'Monochrome Striped Relaxed Fit Tee',
      'Acid Wash Retro Streetwear T-Shirt',
      'Organic Cotton Oversized Pocket Tee',
      'Raw Hem Distressed Skate T-Shirt',
      'Henley Neck Buttoned Cotton Tee',
      'Embroidered Minimalist Crest T-Shirt',
      'Sage Earthtone Washed Crew Neck',
      'Tie-Dye Urban Relaxed Fit T-Shirt',
      'Athletic Dry-Fit Performance Tee',
      'Split Hem Drop Shoulder T-Shirt',
      'Heather Grey Everyday Crew Tee',
      'Charcoal Ribbed Muscle Fit Tee',
      'Typography Back Graphic T-Shirt',
      'Contrast Collar Heritage Polo Tee',
      'Double Knit Seamless Crew T-Shirt'
    ];

    menTshirtNames.forEach((name, i) => {
      const mrp = 999 + (i % 5) * 200;
      const sale = Math.round(mrp * (0.4 + (i % 5) * 0.06));
      allProducts.push(
        buildProduct({
          name,
          brand: brands[(i + 3) % brands.length],
          categorySlug: 't-shirts',
          gender: 'Men',
          subCategory: 'T-Shirts',
          mrp,
          salePrice: sale,
          rating: 4.2 + (i % 7) * 0.1,
          reviewsCount: 120 + i * 35,
          image: imagesPool.menTshirts[i % imagesPool.menTshirts.length],
          tryOnType: 'tshirt',
          material: '100% Super Combed Cotton (220 GSM)',
          fit: i % 2 === 0 ? 'Oversized Boxy Fit' : 'Regular Fit',
          featured: i < 2
        })
      );
      pCounter++;
    });

    // A3: Men's Jeans & Trousers (15 items)
    const menPantsNames = [
      'Tapered Fit Vintage Light Wash Jeans',
      'Relaxed Straight Leg Selvedge Denim',
      'Slim Fit Deep Indigo Raw Jeans',
      'Pleated Wide Leg Cotton Chinos',
      'Cargo Jogger Pants with Utility Pockets',
      'Cropped Tailored Ankle Trousers',
      'Stretch Denim Dark Charcoal Jeans',
      'Classic Khaki Smart Casual Chinos',
      'Distressed Knee Slit Streetwear Denim',
      'Drawstring Elastic Waist Linen Trousers',
      'Heavyweight Canvas Carpenter Pants',
      'Bootcut Vintage Blue Mid-Rise Jeans',
      'Textured Wool Blend Formal Trousers',
      'Olive Drab Military Fatigue Pants',
      'Slim Fit Jet Black Stretchy Jeans'
    ];

    menPantsNames.forEach((name, i) => {
      const mrp = 1999 + (i % 5) * 400;
      const sale = Math.round(mrp * (0.48 + (i % 4) * 0.06));
      allProducts.push(
        buildProduct({
          name,
          brand: brands[(i + 6) % brands.length],
          categorySlug: 'jeans',
          gender: 'Men',
          subCategory: 'Jeans & Trousers',
          mrp,
          salePrice: sale,
          rating: 4.3 + (i % 6) * 0.1,
          reviewsCount: 88 + i * 22,
          image: imagesPool.menJeans[i % imagesPool.menJeans.length],
          tryOnType: 'pants',
          material: '98% Cotton, 2% Elastane Flex Denim',
          fit: i % 2 === 0 ? 'Slim Tapered Fit' : 'Relaxed Straight Fit',
          sizes: ['S', 'M', 'L', 'XL'],
          featured: i === 0
        })
      );
      pCounter++;
    });

    // A4: Men's Jackets & Outerwear (12 items)
    const menJacketNames = [
      'Matte Finish Classic Bomber Jacket',
      'Heavyweight Sherpa Lined Denim Jacket',
      'Tailored Wool Blend Overcoat',
      'Minimalist Track Zip Jacket',
      'Utility Multi-Pocket Safari Jacket',
      'Biker Asymmetric Faux Leather Jacket',
      'Water-Resistant Technical Windbreaker',
      'Puffer Quilted Hooded Winter Jacket',
      'Vintage Corduroy Trucker Jacket',
      'Structured Double-Breasted Blazer',
      'Suede Finish Zip Harrington Jacket',
      'Casual Linen Summer Unstructured Blazer'
    ];

    menJacketNames.forEach((name, i) => {
      const mrp = 3499 + (i % 5) * 700;
      const sale = Math.round(mrp * (0.52 + (i % 3) * 0.05));
      allProducts.push(
        buildProduct({
          name,
          brand: brands[(i + 2) % brands.length],
          categorySlug: 'jackets',
          gender: 'Men',
          subCategory: 'Jackets & Outerwear',
          mrp,
          salePrice: sale,
          rating: 4.5 + (i % 4) * 0.1,
          reviewsCount: 65 + i * 15,
          image: imagesPool.menJackets[i % imagesPool.menJackets.length],
          tryOnType: 'jacket',
          material: i % 2 === 0 ? 'Water-Resistant Matte Poly' : 'Heavy Cotton Twill',
          fit: 'Tailored Fit',
          featured: i < 2
        })
      );
      pCounter++;
    });

    // A5: Men's Hoodies & Sweaters (8 items)
    const menHoodieNames = [
      'Heavyweight 400 GSM Fleece Hoodie',
      'Minimalist Monogram Knit Sweater',
      'Drop-Shoulder Washed Pullover Hoodie',
      'Ribbed Cotton Crewneck Sweater',
      'Zip-Through High-Collar Track Hoodie',
      'French Terry Contrast Pocket Hoodie',
      'Cable Knit Chunky Winter Pullover',
      'Oversized Thermal Fleece Sweatshirt'
    ];

    menHoodieNames.forEach((name, i) => {
      const mrp = 2499 + (i % 4) * 350;
      const sale = Math.round(mrp * (0.45 + (i % 3) * 0.07));
      allProducts.push(
        buildProduct({
          name,
          brand: brands[(i + 4) % brands.length],
          categorySlug: 'hoodies',
          gender: 'Men',
          subCategory: 'Hoodies & Sweaters',
          mrp,
          salePrice: sale,
          rating: 4.4 + (i % 5) * 0.1,
          reviewsCount: 110 + i * 20,
          image: imagesPool.menHoodies[i % imagesPool.menHoodies.length],
          tryOnType: 'hoodie',
          material: '80% Organic Cotton, 20% Recycled Polyester Fleece',
          fit: 'Oversized Relaxed Fit',
          featured: i === 0
        })
      );
      pCounter++;
    });

    // ============================================
    // SECTION B: WOMEN'S COLLECTION (~75 products)
    // ============================================

    // B1: Women's Dresses (22 items)
    const womenDressNames = [
      'Floral Print Tiered Maxi Dress',
      'Satin Silk Bias Cut Slip Dress',
      'Ribbed Knit Bodycon Midi Dress',
      'Square Neck A-Line Cotton Sundress',
      'Off-Shoulder Ruched Cocktail Dress',
      'Embroidered Anarkali Festive Kurta Set',
      'Pleated Georgette Wrap Dress',
      'Linen Button-Down Shirt Dress',
      'Puff Sleeve Tiered Fit & Flare Dress',
      'Velvet Evening Gown with Slit',
      'Boho Print Smocked Waist Maxi Dress',
      'Tailored Blazer Tuxedo Dress',
      'Cut-Out Waistband Cocktail Dress',
      'Chikankari Handcrafted Pure Cotton Kurta',
      'Polka Dot Vintage Swing Dress',
      'Tiered Chiffon Party Slip Dress',
      'Asymmetric Hem Modal Midi Dress',
      'Sweetheart Neckline Jacquard Dress',
      'Pastel Floral Flutter Sleeve Dress',
      'Belted Utility Cotton Shirt Dress',
      'Backless Halter Satin Evening Dress',
      'Mandarin Collar High-Slit Kurta Dress'
    ];

    womenDressNames.forEach((name, i) => {
      const mrp = 1999 + (i % 6) * 500;
      const sale = Math.round(mrp * (0.44 + (i % 4) * 0.08));
      allProducts.push(
        buildProduct({
          name,
          brand: ['DressBerry', 'Tokyo Talkies', 'Anouk', 'Libas', 'Mast & Harbour'][i % 5],
          categorySlug: 'dresses',
          gender: 'Women',
          subCategory: 'Dresses & Gowns',
          mrp,
          salePrice: sale,
          rating: 4.3 + (i % 6) * 0.1,
          reviewsCount: 75 + i * 32,
          image: imagesPool.womenDresses[i % imagesPool.womenDresses.length],
          tryOnType: 'dress',
          material: i % 2 === 0 ? 'Poly Georgette with Lined Inner' : '100% Breathable Rayon',
          fit: i % 3 === 0 ? 'Fit and Flare' : 'Regular Fit',
          featured: i < 3
        })
      );
      pCounter++;
    });

    // B2: Women's Tops & Shirts (18 items)
    const womenTopNames = [
      'Cropped Ribbed Cotton Tank Top',
      'Ruffle Trim Chiffon Blouse',
      'Oversized Boyfriend Linen Shirt',
      'Smocked Peplum Square Neck Top',
      'Embroidered Folkloric Puff Top',
      'Satin Button-Down Silk Shirt',
      'Ribbed Knit Polo Collar Crop Top',
      'Lace Inset Floral Peasant Blouse',
      'Corset Seamed Structured Knit Top',
      'Tie-Front Resort Stripe Blouse',
      'High-Neck Ribbed Seamless Top',
      'Wrap Style Georgette Peplum Top',
      'Vintage Wash Cotton Boxy T-Shirt',
      'Sweetheart Ribbed Long Sleeve Top',
      'Tiered Babydoll Cotton Top',
      'Button-Through Knitted Vest Top',
      'Asymmetric Drape Satin Blouse',
      'Linen Blend Short Sleeve Crop Shirt'
    ];

    womenTopNames.forEach((name, i) => {
      const mrp = 1199 + (i % 5) * 250;
      const sale = Math.round(mrp * (0.42 + (i % 4) * 0.07));
      allProducts.push(
        buildProduct({
          name,
          brand: ['Tokyo Talkies', 'DressBerry', 'HERE&NOW', 'Mast & Harbour'][i % 4],
          categorySlug: 'women',
          gender: 'Women',
          subCategory: 'Tops & Shirts',
          mrp,
          salePrice: sale,
          rating: 4.2 + (i % 7) * 0.1,
          reviewsCount: 95 + i * 20,
          image: imagesPool.womenTops[i % imagesPool.womenTops.length],
          tryOnType: 'tshirt',
          material: 'Cotton Viscose Blend',
          fit: 'Regular Fit',
          featured: i < 2
        })
      );
      pCounter++;
    });

    // B3: Women's Jeans, Trousers & Skirts (15 items)
    const womenBottomNames = [
      'High-Rise Wide Leg Flared Jeans',
      'Straight Fit Vintage Mom Jeans',
      'High-Waist Pleated Ankle Trousers',
      'Slit Hem Clean Cut Denim Midi Skirt',
      'Stretch Skinny Fit Jet Black Jeans',
      'Paperbag Waist Cotton Chino Pants',
      'Cargo Parachute Pants with Toggles',
      'Pleated Satin Slip Midi Skirt',
      'Wide Leg Tailored Linen Trousers',
      'High-Rise Ankle Grazer Distressed Jeans',
      'Split Front Denim Maxi Skirt',
      'High-Waisted Flared Yoga Trousers',
      'Cigarette Cut Formal Stretch Trousers',
      'Button-Front A-Line Corduroy Skirt',
      'Relaxed Fit Boyfriend Denim Pants'
    ];

    womenBottomNames.forEach((name, i) => {
      const mrp = 1799 + (i % 5) * 350;
      const sale = Math.round(mrp * (0.46 + (i % 4) * 0.06));
      allProducts.push(
        buildProduct({
          name,
          brand: ['Roadster', 'Levis', 'Mast & Harbour', 'HERE&NOW'][i % 4],
          categorySlug: 'jeans',
          gender: 'Women',
          subCategory: 'Jeans & Trousers',
          mrp,
          salePrice: sale,
          rating: 4.3 + (i % 6) * 0.1,
          reviewsCount: 82 + i * 28,
          image: imagesPool.womenJeans[i % imagesPool.womenJeans.length],
          tryOnType: 'pants',
          material: '99% Cotton, 1% Spandex Stretch Denim',
          fit: 'High-Rise Relaxed',
          featured: i === 0
        })
      );
      pCounter++;
    });

    // B4: Women's Jackets & Outerwear (12 items)
    const womenJacketNames = [
      'Cropped Denim Trucker Jacket',
      'Faux Fur Collar Biker Leather Jacket',
      'Belted Tailored Long Trenchcoat',
      'Boucle Textured Houndstooth Blazer',
      'Lightweight Puffer Quilted Jacket',
      'Utility Oversized Cotton Shacket',
      'Fringed Suede Finish Western Jacket',
      'Open Front Drape Knit Shrug Cardigan',
      'Oversized Double-Breasted Wool Blazer',
      'Embroidered Denim Festival Jacket',
      'Fleece Lined Windbreaker Bomber',
      'Reversible Padded Winter Vest'
    ];

    womenJacketNames.forEach((name, i) => {
      const mrp = 2999 + (i % 5) * 600;
      const sale = Math.round(mrp * (0.5 + (i % 3) * 0.06));
      allProducts.push(
        buildProduct({
          name,
          brand: ['DressBerry', 'Mast & Harbour', 'Tokyo Talkies', 'Roadster'][i % 4],
          categorySlug: 'jackets',
          gender: 'Women',
          subCategory: 'Jackets & Shrugs',
          mrp,
          salePrice: sale,
          rating: 4.4 + (i % 5) * 0.1,
          reviewsCount: 54 + i * 16,
          image: imagesPool.womenJackets[i % imagesPool.womenJackets.length],
          tryOnType: 'jacket',
          material: 'Heavyweight Woven Blend',
          fit: 'Tailored Regular',
          featured: i === 0
        })
      );
      pCounter++;
    });

    // B5: Women's Handbags & Footwear (8 items)
    const womenAccNames = [
      'Structured Leather Crossbody Bag',
      'Woven Straw Summer Tote Bag',
      'Chunky Sole Retro Platform Sneakers',
      'Block Heel Minimalist Strap Sandals',
      'Vegan Leather Everyday Slouchy Hobo Bag',
      'Pointed Toe Classic Stiletto Pumps',
      'Quilted Chain Strap Evening Clutch',
      'Lug Sole Leather Chelsea Ankle Boots'
    ];

    womenAccNames.forEach((name, i) => {
      const mrp = 1999 + (i % 4) * 400;
      const sale = Math.round(mrp * (0.48 + (i % 3) * 0.08));
      allProducts.push(
        buildProduct({
          name,
          brand: ['DressBerry', 'Mast & Harbour', 'Nautica'][i % 3],
          categorySlug: 'shoes-accessories',
          gender: 'Women',
          subCategory: 'Handbags & Footwear',
          mrp,
          salePrice: sale,
          rating: 4.5 + (i % 4) * 0.1,
          reviewsCount: 140 + i * 40,
          image: imagesPool.accessories[i % imagesPool.accessories.length],
          tryOnType: 'accessory',
          material: 'Premium Vegan Leather',
          fit: 'Standard Fit',
          sizes: ['Free Size'],
          featured: i === 0
        })
      );
      pCounter++;
    });

    // ============================================
    // SECTION C: KIDS COLLECTION (~30 products)
    // ============================================

    const kidsItems = [
      { name: 'Boys Colorblocked Graphic T-Shirt', sub: 'T-Shirts', gender: 'Kids', mrp: 699, sale: 399 },
      { name: 'Girls Floral Print Cotton Frock', sub: 'Dresses', gender: 'Kids', mrp: 999, sale: 549 },
      { name: 'Boys Elastic Waist Denim Shorts', sub: 'Shorts', gender: 'Kids', mrp: 899, sale: 499 },
      { name: 'Girls Ruffled Sleeve Party Dress', sub: 'Dresses', gender: 'Kids', mrp: 1299, sale: 749 },
      { name: 'Kids Unisex Hooded Sweatshirt', sub: 'Hoodies', gender: 'Kids', mrp: 1199, sale: 649 },
      { name: 'Boys Plaid Button-Down Shirt', sub: 'Shirts', gender: 'Kids', mrp: 899, sale: 499 },
      { name: 'Girls Tiered Tutu Skirt Set', sub: 'Dresses', gender: 'Kids', mrp: 1199, sale: 699 },
      { name: 'Boys Jogger Pants with Knee Patches', sub: 'Trousers', gender: 'Kids', mrp: 999, sale: 549 },
      { name: 'Girls Striped Cotton Dungaree', sub: 'Dresses', gender: 'Kids', mrp: 1399, sale: 799 },
      { name: 'Boys Printed Cotton Kurta Pyjama', sub: 'Ethnic Wear', gender: 'Kids', mrp: 1499, sale: 799 },
      { name: 'Girls Embroidered Lehenga Choli Set', sub: 'Ethnic Wear', gender: 'Kids', mrp: 1999, sale: 1099 },
      { name: 'Kids Waterproof Windbreaker Jacket', sub: 'Jackets', gender: 'Kids', mrp: 1499, sale: 849 },
      { name: 'Boys Dinosaur Graphic Cotton Tee', sub: 'T-Shirts', gender: 'Kids', mrp: 599, sale: 349 },
      { name: 'Girls Butterfly Print Summer Top', sub: 'Tops', gender: 'Kids', mrp: 699, sale: 399 },
      { name: 'Kids Slip-On Canvas Sneakers', sub: 'Footwear', gender: 'Kids', mrp: 999, sale: 599 },
      { name: 'Boys Slim Stretch Denim Jeans', sub: 'Jeans', gender: 'Kids', mrp: 1099, sale: 649 },
      { name: 'Girls Polka Dot Fit & Flare Dress', sub: 'Dresses', gender: 'Kids', mrp: 899, sale: 499 },
      { name: 'Kids Puffer Quilted Warm Vest', sub: 'Jackets', gender: 'Kids', mrp: 1299, sale: 699 },
      { name: 'Boys Polo Collar Striped T-Shirt', sub: 'T-Shirts', gender: 'Kids', mrp: 799, sale: 449 },
      { name: 'Girls Daisy Embroidered Denim Jacket', sub: 'Jackets', gender: 'Kids', mrp: 1599, sale: 899 },
      { name: 'Kids Organic Cotton Pyjama Set', sub: 'Sleepwear', gender: 'Kids', mrp: 899, sale: 499 },
      { name: 'Boys Cargo Bermudas with Belt', sub: 'Shorts', gender: 'Kids', mrp: 899, sale: 499 },
      { name: 'Girls Sequined Party Sparkle Dress', sub: 'Dresses', gender: 'Kids', mrp: 1499, sale: 849 },
      { name: 'Kids High-Top Retro Velcro Sneakers', sub: 'Footwear', gender: 'Kids', mrp: 1299, sale: 749 },
      { name: 'Boys Fleece Lined Winter Hoodie', sub: 'Hoodies', gender: 'Kids', mrp: 1199, sale: 649 },
      { name: 'Girls Cotton Smocked Sundress', sub: 'Dresses', gender: 'Kids', mrp: 899, sale: 499 },
      { name: 'Kids Striped Knit Crewneck Sweater', sub: 'Sweaters', gender: 'Kids', mrp: 999, sale: 549 },
      { name: 'Boys Twill Elasticated Jogger Pants', sub: 'Trousers', gender: 'Kids', mrp: 899, sale: 499 },
      { name: 'Girls Unicorn Print Sweatshirt', sub: 'Hoodies', gender: 'Kids', mrp: 999, sale: 549 },
      { name: 'Kids Fleece Tracksuit Set', sub: 'Sets', gender: 'Kids', mrp: 1599, sale: 899 }
    ];

    kidsItems.forEach((item, i) => {
      allProducts.push(
        buildProduct({
          name: item.name,
          brand: ['HERE&NOW Kids', 'Max Kids', 'Roadster Jr', 'H&M Kids'][i % 4],
          categorySlug: 'kids',
          gender: 'Kids',
          subCategory: item.sub,
          mrp: item.mrp,
          salePrice: item.sale,
          rating: 4.4 + (i % 5) * 0.1,
          reviewsCount: 30 + i * 12,
          image: imagesPool.kidsClothing[i % imagesPool.kidsClothing.length],
          tryOnType: 'tshirt',
          material: '100% Skin-Friendly Organic Cotton',
          fit: 'Kids Comfort Fit',
          sizes: ['S', 'M', 'L'],
          featured: i < 2
        })
      );
      pCounter++;
    });

    console.log(`Inserting ${allProducts.length} unique products into MongoDB...`);
    const insertedProducts = await Product.insertMany(allProducts);
    console.log(`✅ Successfully seeded ${insertedProducts.length} unique fashion products across Men, Women & Kids!`);

    // 4. Seed Live Runway Auctions linked to seeded products
    await Auction.deleteMany({});
    const auctionProduct1 = insertedProducts[0]; // First jacket or shirt
    const auctionProduct2 = insertedProducts[10]; // Another piece
    const auctionProduct3 = insertedProducts[35]; // Dress/Coat

    const now = Date.now();
    const auctionsData = [
      {
        product: auctionProduct1._id,
        title: `Runway Drop: ${auctionProduct1.name}`,
        startingPrice: 2499,
        currentPrice: 3200,
        minBidIncrement: 200,
        bidsCount: 5,
        status: 'ACTIVE',
        startTime: new Date(now - 3600000 * 4),
        endTime: new Date(now + 3600000 * 20),
      },
      {
        product: auctionProduct2._id,
        title: `Limited Drop: ${auctionProduct2.name}`,
        startingPrice: 1999,
        currentPrice: 2600,
        minBidIncrement: 200,
        bidsCount: 4,
        status: 'ACTIVE',
        startTime: new Date(now - 3600000 * 2),
        endTime: new Date(now + 3600000 * 28),
      },
      {
        product: auctionProduct3._id,
        title: `Archive Vault: ${auctionProduct3.name}`,
        startingPrice: 3499,
        currentPrice: 4100,
        minBidIncrement: 300,
        bidsCount: 3,
        status: 'ACTIVE',
        startTime: new Date(now - 3600000 * 1),
        endTime: new Date(now + 3600000 * 48),
      }
    ];

    const insertedAuctions = await Auction.insertMany(auctionsData);
    console.log(`✅ Seeded ${insertedAuctions.length} live runway auctions.`);

    console.log('\n======================================================');
    console.log('TRYONVERSE CATALOG SEED COMPLETE!');
    console.log(`Total Products: ${insertedProducts.length}`);
    console.log(`Total Categories: ${createdCategories.length}`);
    console.log(`Total Auctions: ${insertedAuctions.length}`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
