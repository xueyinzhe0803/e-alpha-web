// 产品详情页功能
(function () {
  // 获取URL参数
  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // 获取产品数据
  function getProductData() {
    const dataScript = document.getElementById('product-data');
    if (dataScript) {
      try {
        return JSON.parse(dataScript.textContent);
      } catch (e) {
        console.error('产品数据解析失败:', e);
        return {};
      }
    }
    return {};
  }

  // 渲染产品详情
  function renderProductDetail(productData) {
    const container = document.getElementById('product-content');

    // 检查产品数据是否存在，如果不存在则显示错误信息
    if (!productData) {
      container.innerHTML = `
        <div class="error-message">
          <h2>Product not found</h2>
          <p>Sorry, the product you are looking for does not exist.</p>
          <a href="index.html" class="btn btn-primary">Return to the Home page</a>
        </div>
      `;
      return;
    }

    // 更新页面标题和产品导航
    document.title = `${productData.name} - E-ALPHA 官方站`;
    const breadcrumbProduct = document.getElementById('breadcrumb-product');
    if (breadcrumbProduct) {
      breadcrumbProduct.textContent = productData.name;
    }

    // 生成特性列表HTML
    const featuresHTML = productData.features ?
      productData.features.map(feature => `<li>${feature}</li>`).join('') : '';

    // 生成规格表格HTML
    const specificationsHTML = productData.specifications ?
      Object.entries(productData.specifications).map(([category, specs]) => `
        <div class="spec-category">
          <h3 class="spec-category-title">${category}</h3>
          <table class="spec-table">
            <tbody>
              ${Object.entries(specs).map(([key, value]) => `
                <tr>
                  <th>${key}</th>
                  <td>${value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('') : '';

    // 渲染产品详情HTML
    container.innerHTML = `
      <div class="product-detail-layout">
        <!-- 产品图片区域 -->
        <div class="product-gallery">
          ${productData.imageAvif || productData.imageWebp ? `
            <picture>
              ${productData.imageAvif ? `<source srcset="${productData.imageAvif}" type="image/avif">` : ''}
              ${productData.imageWebp ? `<source srcset="${productData.imageWebp}" type="image/webp">` : ''}
              <img src="${productData.image}" alt="${productData.name}" class="product-main-image" id="main-image">
            </picture>
          ` : `
            <img src="${productData.image}" alt="${productData.name}" class="product-main-image" id="main-image">
          `}
          ${productData.gallery && productData.gallery.length > 1 ? `
            <div class="product-thumbnails">
              ${productData.gallery.map((img, index) => `
                <img src="${img}" alt="${productData.name}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                     onclick="changeMainImage('${img}', this)">
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- 产品信息区域 -->
        <div class="product-info-section">
          <div class="product-header">
            <h1 class="product-title">${productData.name}</h1>
            <p class="product-model">Mdole: ${productData.model}</p>
            <div class="product-price">${productData.price}</div>
            <p class="product-description">${productData.description}</p>
          </div>

          ${productData.features ? `
            <div class="product-features">
              <h2 class="section-title">Product features</h2>
              <ul class="features-list">
                ${featuresHTML}
              </ul>
            </div>
          ` : ''}

          <!-- 购买区域 -->
          <div class="purchase-section">
            <div class="purchase-buttons">
              <button class="btn btn-secondary" onclick="handleInquiry('${productData.model}')">
                Inquiry
              </button>
            </div>
            <div class="purchase-info">
              <p>• Free delivery and installation</p>
              <p>• 2-year warranty</p>
              <p>• Professional team provides training service</p>
            </div>
          </div>

          ${specificationsHTML ? `
            <div class="specifications-section">
              <h2 class="section-title">Technical specifications</h2>
              ${specificationsHTML}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 切换主图片
  window.changeMainImage = function (imageSrc, thumbnail) {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
      mainImage.src = imageSrc;
    }

    // 更新缩略图激活状态
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
  };

  // 处理询价按钮点击
  window.handleInquiry = function (model) {
    alert(
      `You are inquiring about ${model} product information.` +
      `\n\nPlease contact us:` +
      `\nPhone: +64 0800 257 420` +
      `\nNZ Email: customer.service@e-alpha.co.nz` +
      `\nAU Email: customer.service@e-alpha.com.au` +
      `\n\nOur professional advisor will contact you soon.`
    );
  };

  // 页面加载完成后执行
  document.addEventListener('DOMContentLoaded', function () {
    const productId = getUrlParameter('product');
    const allProductData = getProductData();
    const productData = allProductData[productId];

    renderProductDetail(productData);

    // 如果没有找到产品，显示错误信息
    if (!productData) {
      console.warn('未找到产品:', productId);
    }
  });

  // 添加返回顶部功能（当页面内容较长时）
  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 可以在这里添加滚动相关的功能，比如固定导航栏等
    if (scrollTop > 200) {
      // 页面滚动超过200px时的处理
    }
  });

})();

