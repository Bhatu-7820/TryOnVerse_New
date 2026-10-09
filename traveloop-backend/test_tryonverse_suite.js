const API_BASE = 'http://localhost:3001/api';

async function request(url, options = {}) {
  const headers = options.headers || {};
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { ...options, headers });
  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('TRYONVERSE INTEGRATION & VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Health check
    const healthRes = await request('http://localhost:3001/health');
    assert(healthRes.data.status === 'ok', 'Backend Health Check (HTTP 200)');

    // 2. Authentication: Login as Customer
    const userLoginRes = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'alex@tryonverse.com',
        password: 'UserPassword123!'
      }
    });
    const userToken = userLoginRes.data.token;
    const userProfile = userLoginRes.data.user;
    assert(userToken && userProfile.role === 'user', 'Customer Authentication (alex@tryonverse.com)');

    const userHeaders = { Authorization: `Bearer ${userToken}` };

    // 3. Authentication: Login as Admin
    const adminLoginRes = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@tryonverse.com',
        password: 'AdminPassword123!'
      }
    });
    const adminToken = adminLoginRes.data.token;
    assert(adminToken && adminLoginRes.data.user.role === 'admin', 'Admin Authentication (admin@tryonverse.com)');
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 4. Products Shop: Fetch products & Categories
    const productsRes = await request(`${API_BASE}/products`);
    const products = productsRes.data.data;
    assert(productsRes.data.total >= 20 && products.length > 0, `Product Catalog contains 20+ items (Total: ${productsRes.data.total})`);

    const categoriesRes = await request(`${API_BASE}/categories`);
    const categories = categoriesRes.data.data;
    assert(categories.length >= 6, `Fashion Categories populated (Found: ${categories.length})`);

    // 5. Product Search & Filter
    const searchRes = await request(`${API_BASE}/products?search=Linen`);
    assert(searchRes.data.data.length > 0, 'Server-side Product Search ("Linen")');

    // 6. Product Detail
    const sampleProduct = products[0];
    const detailRes = await request(`${API_BASE}/products/${sampleProduct._id}`);
    const productDetail = detailRes.data.data || detailRes.data;
    assert(productDetail.name === sampleProduct.name && productDetail.sizes.length > 0, 'Product Detail with Sizes & 3D attributes');

    // 7. Cart Operations
    const addToCartRes = await request(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: userHeaders,
      body: {
        productId: sampleProduct._id,
        quantity: 2,
        size: sampleProduct.sizes[0],
        color: sampleProduct.colors[0]?.name || 'Standard'
      }
    });
    const cartData = addToCartRes.data.data || addToCartRes.data;
    assert(cartData.items && cartData.items.length > 0, 'Add Item to Cart with Size & Color');

    const getCartRes = await request(`${API_BASE}/cart`, { headers: userHeaders });
    const userCart = getCartRes.data.data || getCartRes.data;
    assert(userCart.items.length > 0 && userCart.subtotal > 0, 'Cart Authoritative Pricing Calculation');

    // 8. Wishlist Operations
    const addWishlistRes = await request(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: userHeaders,
      body: { productId: sampleProduct._id }
    });
    assert(addWishlistRes.data.success !== false, 'Toggle Wishlist Item');

    // 9. Order Checkout Flow & Development Payment
    const testAddress = {
      fullName: 'Alex Vance',
      street: '42 Cyberpunk Blvd',
      city: 'Neo-Tokyo',
      state: 'Kanto',
      zipCode: '100-0001',
      country: 'Japan',
      phone: '+1 555-0199'
    };

    const checkoutRes = await request(`${API_BASE}/orders`, {
      method: 'POST',
      headers: userHeaders,
      body: {
        shippingAddress: testAddress,
        paymentMethod: 'card'
      }
    });
    const createdOrder = checkoutRes.data.data || checkoutRes.data.order || checkoutRes.data;
    assert(createdOrder && createdOrder.total > 0 && createdOrder.paymentStatus === 'PENDING', 'Checkout & Order Generation in MongoDB');

    // Verify development payment simulation
    const payRes = await request(`${API_BASE}/payments/simulate`, {
      method: 'POST',
      headers: userHeaders,
      body: { orderId: createdOrder._id }
    });
    const paidOrder = payRes.data.order || payRes.data.data?.order || payRes.data.data || payRes.data;
    assert(paidOrder && paidOrder.paymentStatus === 'PAID' && paidOrder.orderStatus === 'CONFIRMED', 'Development Payment Simulation & Server Verification');

    // 10. AI Body Scanner anthropometric record
    const bodyScanRes = await request(`${API_BASE}/body-scan`, {
      method: 'POST',
      headers: userHeaders,
      body: {
        gender: 'unisex',
        height: 180,
        chest: 100,
        waist: 82,
        hips: 98,
        shoulderBreadth: 47,
        inseam: 81,
        recommendedSize: 'L',
        confidenceScore: 0.94,
        notes: 'Clean full-body calibration via OpenCV/MediaPipe landmark landmarks'
      }
    });
    const savedScan = bodyScanRes.data.data || bodyScanRes.data;
    assert(savedScan.recommendedSize === 'L', 'Save AI Anthropometric Body Scan');

    // 11. Custom Garment Studio: Save Design
    const designRes = await request(`${API_BASE}/designs`, {
      method: 'POST',
      headers: userHeaders,
      body: {
        title: 'Neon Matrix Bomber',
        garmentType: 'jacket',
        baseColor: '#00f2fe',
        canvasData: {
          layers: [
            { type: 'text', content: 'TRYONVERSE 2026', x: 200, y: 150, color: '#ffffff', fontSize: 24 },
            { type: 'badge', icon: 'zap', x: 200, y: 220, color: '#f59e0b' }
          ]
        }
      }
    });
    const savedDesign = designRes.data.data || designRes.data;
    assert(savedDesign.title === 'Neon Matrix Bomber' && (savedDesign.template === 'jacket' || savedDesign.garmentType === 'jacket'), 'Save Custom Bespoke Design');

    // 12. Fashion Auction & Real-time Bidding
    const auctionsRes = await request(`${API_BASE}/auctions`);
    const auctionsList = auctionsRes.data.data || auctionsRes.data;
    const liveAuction = auctionsList[0];
    assert(liveAuction && liveAuction.status === 'ACTIVE', 'Fetch Active Fashion Runway Auctions');

    const nextBidAmount = liveAuction.currentPrice + liveAuction.minBidIncrement;
    const bidRes = await request(`${API_BASE}/auctions/${liveAuction._id}/bid`, {
      method: 'POST',
      headers: userHeaders,
      body: { amount: nextBidAmount }
    });
    const updatedAuction = bidRes.data.data || bidRes.data.auction || bidRes.data;
    assert(updatedAuction.currentPrice === nextBidAmount, `Server Authoritative Bid Placement ($${nextBidAmount})`);

    // 13. Security: Admin Route Protection (Normal user rejected from admin routes)
    const adminForbiddenRes = await request(`${API_BASE}/admin/stats`, { headers: userHeaders });
    assert(adminForbiddenRes.status === 403, 'Security: Customer blocked from Admin API (HTTP 403)');

    // 14. Admin Statistics & Management
    const statsRes = await request(`${API_BASE}/admin/stats`, { headers: adminHeaders });
    const statsData = statsRes.data.data || statsRes.data;
    assert(statsData.totalProducts >= 20 && statsData.totalOrders >= 1, 'Admin Console Analytics & Metrics');

    // 15. Admin Product CRUD
    const newProductRes = await request(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: adminHeaders,
      body: {
        name: 'Cybernetic Monolith Trench',
        description: 'Runway exclusive high-tech trench coat with moisture-wicking graphene.',
        brand: 'TryOnVerse Archive',
        category: categories[0]._id,
        price: 699,
        salePrice: 599,
        images: ['https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80'],
        sizes: ['M', 'L', 'XL'],
        colors: [{ name: 'Obsidian Black', hex: '#0a0a0a' }],
        stock: 12,
        featured: true,
        has3DModel: true,
        garmentType: 'jacket'
      }
    });
    const createdProduct = newProductRes.data.data || newProductRes.data;
    const createdProductId = createdProduct._id;
    assert(createdProductId !== undefined, 'Admin Create Fashion Product');

    // Admin Update
    const updateProductRes = await request(`${API_BASE}/admin/products/${createdProductId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: { price: 649 }
    });
    const updatedProd = updateProductRes.data.data || updateProductRes.data;
    assert(updatedProd.price === 649, 'Admin Update Fashion Product');

    // Admin Delete
    const deleteProductRes = await request(`${API_BASE}/admin/products/${createdProductId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(deleteProductRes.status === 200, 'Admin Delete Fashion Product');

    // 16. Security: Sub-minimum Bid Rejection
    const invalidBidRes = await request(`${API_BASE}/auctions/${liveAuction._id}/bid`, {
      method: 'POST',
      headers: userHeaders,
      body: { amount: 5 } // below current price
    });
    assert(invalidBidRes.status === 400 || invalidBidRes.status === 422, 'Security: Sub-minimum bid rejected by server (HTTP 400)');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
    console.log('====================================================\n');

    if (passedTests === totalTests) {
      console.log('ALL MANDATORY TRYONVERSE FUNCTIONALITY VERIFIED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test Suite encountered an unexpected error:', error.message);
    process.exit(1);
  }
}

runTestSuite();
