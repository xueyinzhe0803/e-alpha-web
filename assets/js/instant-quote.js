// Instant Quote 页面交互功能

// EmailJS 配置
const EMAILJS_CONFIG = {
  serviceId: 'service_iyzepj4', //  EmailJS 服务 ID
  templateId: 'template_kq6j1za', //  EmailJS 模板 ID
  customerTemplateId: 'template_akjjtqf', // 客户模板 ID
  publicKey: '2_M2I-HoLWufJ2ScO' //  EmailJS 公钥 // 客户模板 ID
};
// 记录本次 Quote 实际使用的邮箱（用于成功提示显示）
let lastUsedEmail = 'sales@e-alpha.co.nz';

// ========= 国家识别（仅国家，不存 IP） =========
let detectedCountry = 'NZ'; // 默认兜底：新西兰

fetch('https://ipapi.co/json/')
  .then(res => res.json())
  .then(data => {
    if (data && ['NZ', 'AU'].includes(data.country_code)) {
      detectedCountry = data.country_code;
    }
  })
  .catch(() => {
    // 失败就用 NZ
  });

document.addEventListener('DOMContentLoaded', function () {
  // 初始化 EmailJS
  emailjs.init(EMAILJS_CONFIG.publicKey);
  const form = document.getElementById('quoteForm');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const step4 = document.getElementById('step4');
  const quoteResult = document.getElementById('quoteResult');
  const resultContent = document.getElementById('resultContent');

  const nextStep1Btn = document.getElementById('nextStep1');
  const nextStep2Btn = document.getElementById('nextStep2');
  const nextStep3Btn = document.getElementById('nextStep3');
  const prevStep2Btn = document.getElementById('prevStep2');
  const prevStep3Btn = document.getElementById('prevStep3');
  const prevStep4Btn = document.getElementById('prevStep4');
  const newQuoteBtn = document.getElementById('newQuote');

  let currentStep = 1;

  // 步骤切换功能
  function showStep(stepNumber) {
    // 隐藏所有步骤
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    step4.classList.remove('active');
    quoteResult.style.display = 'none';

    // 显示目标步骤
    if (stepNumber === 1) {
      step1.classList.add('active');
    } else if (stepNumber === 2) {
      step2.classList.add('active');
    } else if (stepNumber === 3) {
      step3.classList.add('active');
    } else if (stepNumber === 4) {
      step4.classList.add('active');
    } else if (stepNumber === 'result') {
      quoteResult.style.display = 'block';
    }

    currentStep = stepNumber;
  }

  // 验证表单字段
  function validateStep1() {
    const requiredFields = [
      'vehicleMake',
      'vehicleModel',
      'dwellingType',
      'garageAttached',
      'switchboardLocation'
    ];

    let isValid = true;

    requiredFields.forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      const formGroup = field.closest('.form-group');

      if (field.type === 'radio') {
        const radioGroup = document.querySelectorAll(`[name="${fieldName}"]`);
        const isChecked = Array.from(radioGroup).some(radio => radio.checked);

        if (!isChecked) {
          formGroup.classList.add('error');
          isValid = false;
        } else {
          formGroup.classList.remove('error');
        }
      } else {
        if (!field.value.trim()) {
          formGroup.classList.add('error');
          isValid = false;
        } else {
          formGroup.classList.remove('error');
        }
      }
    });

    return isValid;
  }

  function validateStep2() {
    const supplyCharger = document.querySelectorAll('[name="supplyCharger"]');
    const isChecked = Array.from(supplyCharger).some(radio => radio.checked);

    if (!isChecked) {
      const formGroup = supplyCharger[0].closest('.form-group');
      formGroup.classList.add('error');
      return false;
    } else {
      const formGroup = supplyCharger[0].closest('.form-group');
      formGroup.classList.remove('error');
      return true;
    }
  }

  function validateStep3() {
    // Step 3 没有必填字段，总是返回 true
    return true;
  }

  function validateStep4() {
    const requiredFields = [
      'firstName',
      'lastName',
      'streetAddress',
      'state',
      'suburb',
      'email',
      'phone',
      'hearAbout'
    ];

    let isValid = true;

    requiredFields.forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      const formGroup = field.closest('.form-group');

      if (!field.value.trim()) {
        formGroup.classList.add('error');
        isValid = false;
      } else {
        formGroup.classList.remove('error');
      }
    });

    // 验证邮箱格式
    const emailField = document.querySelector('[name="email"]');
    const emailValue = emailField.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailValue && !emailRegex.test(emailValue)) {
      const formGroup = emailField.closest('.form-group');
      formGroup.classList.add('error');
      isValid = false;
    }

    return isValid;
  }

  // 收集表单数据
  function collectFormData() {
    const formData = new FormData(form);
    const data = {};

    // 收集所有表单字段
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  // 格式化表单数据为邮件内容
  function formatEmailContent(data) {
    const dwellingTypeMap = {
      'single': 'Single Storey',
      'double': 'Double Storey',
      'other': 'Other'
    };

    const garageAttachedMap = {
      'yes': 'Garage is attached to my house',
      'no': 'Garage is NOT attached to my house'
    };

    const supplyChargerMap = {
      'yes': 'Yes please',
      'no': 'No Thank You'
    };

    const hearAboutMap = {
      'google': 'Google Search',
      'other-search': 'Other Search Engine',
      'social-media': 'Social Media',
      'tesla-website': 'Tesla website',
      'word-of-mouth': 'Word of mouth',
      'other': 'Other'
    };

    return `
New EV charger installation quote request

=== Vehicle and Residential Information ===
Vehicle Make: ${data.vehicleMake}
Vehicle Model: ${data.vehicleModel}
Dwelling Type: ${dwellingTypeMap[data.dwellingType]}
Garage Attached: ${garageAttachedMap[data.garageAttached]}
Switchboard Location: ${data.switchboardLocation}
Distance between Charger and Switchboard: ${data.distance || 'N/A'} meters

=== Charger Information ===
Supply Charger: ${supplyChargerMap[data.supplyCharger]}

=== Additional Information ===
${data.additionalInfo || 'N/A'}

=== Contact Information ===
FirstName: ${data.firstName} ${data.lastName}
Street Address: ${data.streetAddress}
State: ${data.state}
Suburb: ${data.suburb}
Email: ${data.email}
Phone: ${data.phone}
Hear About: ${hearAboutMap[data.hearAbout]}

---
This email is sent by the E-ALPHA website Instant Quote form
    `;
  }

  // 显示邮件发送成功结果
  function displayEmailSuccess() {
    resultContent.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✓</div>
                <h3>Inquiry has been successfully sent!</h3>
                <h3>Thank you for your submission. We have received your information and 
                will get back to you as soon as possible.</h3>
                <div class="contact-info">
                    <p><strong>Contact Email:</strong> ${lastUsedEmail}</p>
                    <p><strong>Estimated Response Time:</strong> 24 hours</p>
                </div>
            </div>
        `;
  }

  // 显示邮件发送失败结果
  function displayEmailError() {
    resultContent.innerHTML = `
            <div class="error-message">
                <div class="error-icon">✗</div>
                <h3>Sending Failed</h3>
                <p>Sorry, the email sending failed. Please try again later or contact our email directly:</p>
                <div class="contact-info">
                    <p><strong>Email:</strong> sales@e-alpha.co.nz</p>
                </div>
            </div>
        `;
  }

  // 事件监听器
  nextStep1Btn.addEventListener('click', function () {
    if (validateStep1()) {
      showStep(2);
    } else {
      // 滚动到第一个错误字段
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  nextStep2Btn.addEventListener('click', function () {
    if (validateStep2()) {
      showStep(3);
    } else {
      // 滚动到第一个错误字段
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  nextStep3Btn.addEventListener('click', function () {
    if (validateStep3()) {
      showStep(4);
    } else {
      // 滚动到第一个错误字段
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  prevStep2Btn.addEventListener('click', function () {
    showStep(1);
  });

  prevStep3Btn.addEventListener('click', function () {
    showStep(2);
  });

  prevStep4Btn.addEventListener('click', function () {
    showStep(3);
  });

  newQuoteBtn.addEventListener('click', function () {
    form.reset();
    showStep(1);
    // 清除所有错误状态
    document.querySelectorAll('.form-group.error').forEach(group => {
      group.classList.remove('error');
    });
  });

  // 发送邮件功能
  function sendEmail(formData) {
    return new Promise((resolve, reject) => {
      // 准备邮件模板参数
      // 准备邮件模板参数（最小改动：同时提供 camelCase 和 snake_case 两套键）
      // ========= 决定最终国家（用户填写地址优先，其次 IP） =========
      let finalCountry = detectedCountry;
      // console.log('Detected country:', detectedCountry);

      // 如果你未来加 country 字段，可以在这里 override
      // if (formData.country === 'AU' || formData.country === 'NZ') {
      //   finalCountry = formData.country;
      // }

      const toEmail =
        finalCountry === 'AU'
          ? 'sales@e-alpha.com.au'
          : 'sales@e-alpha.co.nz';
      // 记录本次使用的邮箱（给成功提示用）
      lastUsedEmail = toEmail;

      const templateParams = {
        // ——— 收件与主题/基础信息 ———
        to_email: toEmail,
        // 主题里用到 {{firstName}} {{lastName}}
        firstName: formData.firstName,
        lastName: formData.lastName,

        // Reply-To 通常用 {{email}}，因此同时提供两种写法
        email: formData.email,              // 模板里如果是 {{email}} 会取到
        from_email: formData.email,         // 你之前用到的写法，保留兼容
        phone: formData.phone,

        // ——— 正文：车辆/房屋信息 ———
        vehicleMake: formData.vehicleMake,
        vehicle_make: formData.vehicleMake,

        vehicleModel: formData.vehicleModel,
        vehicle_model: formData.vehicleModel,

        dwellingType: formData.dwellingType,
        dwelling_type: formData.dwellingType,

        garageAttached: formData.garageAttached,
        garage_attached: formData.garageAttached,

        switchboardLocation: formData.switchboardLocation,
        switchboard_location: formData.switchboardLocation,

        distance: formData.distance || 'N/A',

        supplyCharger: formData.supplyCharger,
        supply_charger: formData.supplyCharger,

        additionalInfo: formData.additionalInfo || 'N/A',
        additional_info: formData.additionalInfo || 'N/A',

        // ——— 正文：联系信息 ———
        streetAddress: formData.streetAddress,
        street_address: formData.streetAddress,

        state: formData.state,
        suburb: formData.suburb,

        hearAbout: formData.hearAbout,
        hear_about: formData.hearAbout,

        // 可选：整段汇总（如果模板里用了 {{message}}）
        message: formatEmailContent(formData),

        // 可选：你原来写的 subject 字段也可以保留（模板不用也没影响）
        subject: `EV charger installation consultation - ${formData.firstName} ${formData.lastName}`
      };


      // 使用 EmailJS 发送邮件
      emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
        .then(async (response) => {
          // console.log('Email sending was successful:', response.status, response.text);
          // ===== 第二封：发给客户的确认函 =====
          const customerParams = {
            to_email: (formData.email || '').trim(), // 发给客户
            firstName: formData.firstName,
            vehicleMake: formData.vehicleMake,
            vehicleModel: formData.vehicleModel,
            dwellingType: formData.dwellingType,
            garageAttached: formData.garageAttached,
            switchboardLocation: formData.switchboardLocation,
            distance: formData.distance || 'N/A',
            supplyCharger: formData.supplyCharger,
            additionalInfo: formData.additionalInfo || 'N/A'
          };
          await new Promise((res) => setTimeout(res, 100));
          try {
            await emailjs.send(
              EMAILJS_CONFIG.serviceId,
              EMAILJS_CONFIG.customerTemplateId,
              customerParams
            );
            console.log('The customer confirmation email has been sent');
          } catch (err) {
            console.error('The customer confirmation email sending was failed:', err);
          }

          resolve(true);
        })
        .catch((error) => {
          console.error('Email sending was failed:', error);
          reject(error);
        });
    });
  }

  // 表单提交
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (validateStep4()) {
      const formData = collectFormData();

      // 显示加载状态
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '发送中...';
      submitBtn.disabled = true;

      // 发送邮件
      sendEmail(formData)
        .then(() => {
          displayEmailSuccess();
          showStep('result');
        })
        .catch((error) => {
          console.error('邮件发送失败:', error);
          displayEmailError();
          showStep('result');
        })
        .finally(() => {
          // 恢复按钮状态
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    } else {
      // 滚动到错误字段
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  // 实时验证
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function () {
      const formGroup = this.closest('.form-group');
      if (this.type === 'radio') {
        const radioGroup = document.querySelectorAll(`[name="${this.name}"]`);
        const isChecked = Array.from(radioGroup).some(radio => radio.checked);
        if (isChecked) {
          formGroup.classList.remove('error');
        }
      } else if (this.type === 'email') {
        const emailValue = this.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailValue && emailRegex.test(emailValue)) {
          formGroup.classList.remove('error');
        }
      } else {
        if (this.value.trim()) {
          formGroup.classList.remove('error');
        }
      }
    });
  });

  // 添加错误消息元素
  function addErrorMessage(formGroup, message) {
    let errorMsg = formGroup.querySelector('.error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      formGroup.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
  }

  // 初始化页面
  showStep(1);
});
