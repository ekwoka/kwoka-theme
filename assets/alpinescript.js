console.log('Registering Alpine Init Listener');
    document.addEventListener('alpine:init', () => {
        console.log('Alpine Initializing');
        Alpine.data('emailCaptureSection', () => ({
            url: 'https://manage.kmail-lists.com/ajax/subscriptions/subscribe',
            listID: '',
            code: '',
            fetchData(data) {
                return {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: data
                }
            },
            email:'',
            show: false,
            sending: false,
            success: false,
            error: false,
            existed: false,
            async fetchCoupon() {
                if(this.code) return await fetch(`https://{{ request.host }}/discount/${code}`);
            },
            async submitEmail() {
                this.sending = true;
                data = new URLSearchParams();
                data.set('g', this.listID);
                data.set('email',this.email);
                response = await fetch(this.url,this.fetchData(data.toString()));
                if(response.ok) window.localStorage.setItem('subscribed',true);
                data = await response?.json();
                if(response.ok) this.sending = false;
                if(data?.data?.is_subscribed) return this.existed = true;
                if(!data?.success) return this.error = true;
                this.success = true;
                console.log(data);
                await this.fetchCoupon();
            },
            init() {
                console.log('initializing newsletter capture');
                subscribed = window.localStorage.getItem('subscribed');
                this.show = !subscribed
                if(subscribed) return console.log('User Already Subscribed.\nHiding Newsletter Signup.');
                return console.log('User not subscribed.\nShowing Newsletter Signup.');
            }
        }));
        Alpine.data('themeAlpine', () => ({
            menuOpen: false,
            cartOpen: false,
            cart: {
                "items": [],
                "items_subtotal_price": 0,
            },
            get subtotalPrice(){
                return this.cart.items_subtotal_price
            },
            get discountValue(){
                if(this.discountIndex != -1) return this.subtotalPrice * (1- this.discounts[discountIndex].multiplier);
                return 0;
            },
            shippingCost(showShippingThreshold){
                if(this.totalPriceWithoutShipping >= this.themeSettings.freeShippingThreshold && showShippingThreshold) return 0;
                return this.themeSettings.estimatedShipping; 
            },
            get totalPriceWithoutShipping(){
                if(this.discountIndex != -1) return this.cart.items_subtotal_price;
                return this.cart.items_subtotal_price - this.discountValue;
            },
            themeSettings: {
                /* "freeShippingThreshold": {{ settings.freeShippingThreshold }},
                "estimatedShipping": {{ settings.estimatedShipping }} */
            },
            cartMessage: "Cart",
            productAdded: false,
            storeUrl: "kwoka-test-theme.myshopify.com",
            get discountCode() {return getCookie("discount_code");},
            discounts: [
                /* {%- if settings.displayDiscounts -%}
                    {%- assign discounts = settings.discountCodes | split: "," -%}
                    {%- for discount in discounts -%}
                        {%- assign code = discount | split: ':' | first -%}
                        {%- assign multiplier = discount | split: ':' | last %}
                {
                    "code":"{{code}}",
                    "multiplier": {{multiplier}}
                },
                    {%- endfor -%}
                {%- endif %} */
            ],
            cartText(showEstimatedShipping,showShippingThreshold){
                var lines = [];
                if(this.subtotalPrice == 0)return [{'label':'Total','value':this.formatCurrency(0)}];
                if (this.discountIndex != -1 || showEstimatedShipping) lines.push({'label':'Subtotal','value':this.formatCurrency(this.subtotalPrice)});
                if (this.discountIndex != -1) lines.push({'label':'Discount','value':this.formatCurrency(0-this.discountValue)});
                if (showEstimatedShipping) lines.push({'label':'Estimated Shipping','value':this.formatCurrency(this.shippingCost(showShippingThreshold))});
                lines.push({'label':'Total','value':this.totalPriceFormatted(showEstimatedShipping,showShippingThreshold)});

                return lines;
            },
            get shippingThresholdMessage(){
                var valueRemaining = this.themeSettings.freeShippingThreshold - this.totalPriceWithoutShipping;
                if(valueRemaining <=0) return 'Congratulations, you qualify for FREE shipping!';
                return `Add ${this.formatCurrency(valueRemaining)} to your cart to qualify for FREE Shipping`;
            },
            get discountIndex(){
                return this.discounts.findIndex(x => x.code.toLowerCase() === this.discountCode.toLowerCase())
            },
            init(){
                console.log('Initializing themeAlpine');
                this.fetchCart();
            },
            async fetchCart(){
                var response = await fetch(`https://${this.storeUrl}/cart.js`);
                var data = await response.json();
                this.cart = data;
            },
            async updateCart(line,quantity){
                var formData = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify({
                        'line': line,
                        'quantity': quantity,
                    })
                };
                var response = await fetch(`https://${this.storeUrl}/cart/change.js`, formData);
                if (!response.ok) return this.fetchCart();
                var data = await response.json();
                this.cart.items_subtotal_price = data.items_subtotal_price;
            },
            async addCart(index,id,quantity){
                var formData = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        'id': id,
                        'quantity': quantity,
                    })
                };
                var response = await fetch(`https://${this.storeUrl}/cart/add.js`,formData);
                this.fetchCart();
            },
            dataImg(url){
                if (url.includes(".jpg")) return url.replace(".jpg","_{width}x.jpg");
                if (url.includes(".png")) return url.replace(".png","_{width}x.png");
                return url;
            },
            formatCurrency(price){
                var formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                });

                return formatter.format(price/100);
            },
            discountPrice(price){
                if (this.discountIndex == -1) return "null";
                var newPrice = price*(1-this.discounts[this.discountIndex].multiplier);
                return this.formatCurrency(newPrice);
            },
            totalPriceFormatted(showEstimatedShipping,showShippingThreshold){
                if(showEstimatedShipping) return this.formatCurrency(this.totalPriceWithoutShipping+this.shippingCost(showShippingThreshold));
                return this.formatCurrency(this.totalPriceWithoutShipping);
            },
            savings(price){
                if (this.discountIndex == -1) return "null";
                var newPrice = price*this.discounts[this.discountIndex].multiplier;
                return '-'+this.formatCurrency(newPrice);
            }
        }));
    });

/*     function themeAlpine(){
        return {
            menuOpen: false,
            cartOpen: false,
            cart: {
                "items": [],
                "items_subtotal_price": 0,
            },
            get subtotalPrice(){
                return this.cart.items_subtotal_price
            },
            get discountValue(){
                if(this.discountIndex != -1) return this.subtotalPrice * (1- this.discounts[discountIndex].multiplier);
                return 0;
            },
            shippingCost(showShippingThreshold){
                if(this.totalPriceWithoutShipping >= this.themeSettings.freeShippingThreshold && showShippingThreshold) return 0;
                return this.themeSettings.estimatedShipping; 
            },
            get totalPriceWithoutShipping(){
                if(this.discountIndex != -1) return this.cart.items_subtotal_price;
                return this.cart.items_subtotal_price - this.discountValue;
            },
            themeSettings: {
<!--                 "freeShippingThreshold": {{ settings.freeShippingThreshold }},
                "estimatedShipping": {{ settings.estimatedShipping }} -->
            },
            cartMessage: "Cart",
            productAdded: false,
            storeUrl: "kwoka-test-theme.myshopify.com",
            get discountCode() {return getCookie("discount_code");},
            discounts: [
<!--                 {%- if settings.displayDiscounts -%}
                    {%- assign discounts = settings.discountCodes | split: "," -%}
                    {%- for discount in discounts -%}
                        {%- assign code = discount | split: ':' | first -%}
                        {%- assign multiplier = discount | split: ':' | last %}
                {
                    "code":"{{code}}",
                    "multiplier": {{multiplier}}
                },
                    {%- endfor -%}
                {%- endif %} -->
            ],
            cartText(showEstimatedShipping,showShippingThreshold){
                var lines = [];
                if(this.subtotalPrice == 0)return [{'label':'Total','value':this.formatCurrency(0)}];
                if (this.discountIndex != -1 || showEstimatedShipping) lines.push({'label':'Subtotal','value':this.formatCurrency(this.subtotalPrice)});
                if (this.discountIndex != -1) lines.push({'label':'Discount','value':this.formatCurrency(0-this.discountValue)});
                if (showEstimatedShipping) lines.push({'label':'Estimated Shipping','value':this.formatCurrency(this.shippingCost(showShippingThreshold))});
                lines.push({'label':'Total','value':this.totalPriceFormatted(showEstimatedShipping,showShippingThreshold)});

                return lines;
            },
            get shippingThresholdMessage(){
                var valueRemaining = this.themeSettings.freeShippingThreshold - this.totalPriceWithoutShipping;
                if(valueRemaining <=0) return 'Congratulations, you qualify for FREE shipping!';
                return `Add ${this.formatCurrency(valueRemaining)} to your cart to qualify for FREE Shipping`;
            },
            get discountIndex(){
                return this.discounts.findIndex(x => x.code.toLowerCase() === this.discountCode.toLowerCase())
            },
            alpineInit(){
                this.fetchCart();
            },
            async fetchCart(){
                var response = await fetch(`https://${this.storeUrl}/cart.js`);
                var data = await response.json();
                this.cart = data;
            },
            async updateCart(line,quantity){
                var formData = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify({
                        'line': line,
                        'quantity': quantity,
                    })
                };
                var response = await fetch(`https://${this.storeUrl}/cart/change.js`, formData);
                if (!response.ok) return this.fetchCart();
                var data = await response.json();
                this.cart.items_subtotal_price = data.items_subtotal_price;
            },
            async addCart(index,id,quantity){
                var formData = {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        'id': id,
                        'quantity': quantity,
                    })
                };
                var response = await fetch(`https://${this.storeUrl}/cart/add.js`,formData);
                this.fetchCart();
            },
            dataImg(url){
                if (url.includes(".jpg")) return url.replace(".jpg","_{width}x.jpg");
                if (url.includes(".png")) return url.replace(".png","_{width}x.png");
                return url;
            },
            formatCurrency(price){
                var formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: '{{cart.currency.iso_code}}',
                });

                return formatter.format(price/100);
            },
            discountPrice(price){
                if (this.discountIndex == -1) return "null";
                var newPrice = price*(1-this.discounts[this.discountIndex].multiplier);
                return this.formatCurrency(newPrice);
            },
            totalPriceFormatted(showEstimatedShipping,showShippingThreshold){
                if(showEstimatedShipping) return this.formatCurrency(this.totalPriceWithoutShipping+this.shippingCost(showShippingThreshold));
                return this.formatCurrency(this.totalPriceWithoutShipping);
            },
            savings(price){
                if (this.discountIndex == -1) return "null";
                var newPrice = price*this.discounts[this.discountIndex].multiplier;
                return '-'+this.formatCurrency(newPrice);
            }
        }
    }; */

    /* function emailCaptureSection() {
        return {
            url: 'https://manage.kmail-lists.com/ajax/subscriptions/subscribe',
            listID: '',
            code: '',
            fetchData(data) {
                return {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: data
                }
            },
            email:'',
            show: false,
            sending: false,
            success: false,
            error: false,
            existed: false,
            async fetchCoupon() {
                if(this.code) return await fetch(`https://{{ request.host }}/discount/${code}`);
            },
            async submitEmail() {
                this.sending = true;
                data = new URLSearchParams();
                data.set('g', this.listID);
                data.set('email',this.email);
                response = await fetch(this.url,this.fetchData(data.toString()));
                if(response.ok) window.localStorage.setItem('subscribed','true');
                data = await response?.json();
                if(response.ok) this.sending = false;
                if(data?.data?.is_subscribed) return this.existed = true;
                if(!data?.success) return this.error = true;
                this.success = true;
                console.log(data);
                await this.fetchCoupon();
            },
            init() {
                console.log('initializing...');
                subscribed = window.localStorage.getItem('subscribed');
                this.show = !subscribed
                if(subscribed == true) return console.log('User Already Subscribed\nHiding Newsletter Signup');
                return console.log('User not subscribed. Showing Newsletter Signup');
            }
        }
    } */
/* Global Functions */


function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "null";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  console.log('Setting Cookie: ' + cname + '\nto:' + expires);
}