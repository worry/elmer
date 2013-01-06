(function ($) {
    var Product = Backbone.Model.extend();
    var restfulApp = Backbone.Router.extend({
        restfulUrl:"https://api.svpply.com/v1/",
        dataType: 'jsonp',
        routes:{
            "products/:id":"productAction", //This matches app/products/* and assigns * to a variable called "product"
            "shop*page":"fullAction", //This matches app/shop/* and assigns * to a variable called "product"
            "login*page":"loginAction", //This simply matches login and assigns it to "page"
            "*page":"defaultAction" //This simply matches any urls that weren't caught above and assigns it to "page"
        },

        defaultAction:function (page) {
            if (page) {
                routerLocation = 'page';
                //Once the default action is called we want to construct a link to our restful service
                var restfulPageUrl = this.restfulUrl + page + 'page';
                //Now we have a url lets get the data
                this.loadRestfulData(restfulPageUrl);
                console.log('default action');
            }
        },
        loginAction:function (page) {
          // Deferred login until there's another service to keep the token secure-- backbone would expose the secret and token.
            if (page) {
                routerLocation = 'loginAction';
                //Once the default action is called we want to construct a link to our restful service
                var restfulPageUrl = this.restfulUrl + page + 'page';
                //Now we have a url lets get the data
                this.loadRestfulData(restfulPageUrl);
                console.log('login action');
            }
        },
        productAction:function (product) {
            routerLocation = 'productAction';
            //Once the default action is called we want to construct a link to our restful service
            var restfulPageUrl = this.restfulUrl + 'products/' + product + '.jsonp';
            //Now we have a url lets get the data
            this.loadRestfulData(restfulPageUrl);
                console.log('product action');

        },
        fullAction:function (category) {
            routerLocation = 'fullAction';
            //Once the default action is called we want to construct a link to our restful service
            //This one may be too specific to be the full action, because it starts with the shop category.
            //Category list seems to not work when navigating to a new page.
            var restfulPageUrl = this.restfulUrl + 'shop' + category + '.json';
            $('body').attr({class: ''});
            categoryList = category.replace(/\//g,'_');
            $('body').addClass('nav' + categoryList);
            this.loadRestfulData(restfulPageUrl);
            console.log(restfulPageUrl);
            console.log(category);
            console.log('full action');
        },
        loadRestfulData:function (pageUrl) {


            //Set the content pane to a loading screen
            $('#content-pane').html('<div class="loading">loading data...</div>');

            //Load the data in using jQuerys ajax call



            if (routerLocation == 'productAction'){
              // If product? Add later.
              $.ajax({
                  url:pageUrl,
                  dataType:'jsonp',
                  success:function (data) {
                    // console.log('productAction');
                      //Once we receive the data, set it to the content pane.
                      // console.log(data);
                      // console.log(data.response.product.page_title);
                      // $('#content-pane').text(data);
                      // Doin' it wrong.  Need to make a model to contain Product, then a collection.
                      var product = { 
                        page_categories: data.response.product.categories,                               
                        page_title: data.response.product.page_title, 
                        buy_url: data.response.product.page_url,
                        price: data.response.product.formatted_price, 
                        saves: data.response.product.saves, 
                        image: data.response.product.image,
                        user: data.response.product.user,
                        store: data.response.product.store
                      };

                      // Empty out category list.
                      var product_category_list = '';
                      product.page_categories.forEach(
                      function (el, i) {
                        // Mash, cut and strip my way to a url that matches something in my routes.
                        var product_category_url = el.url.replace("https://api.svpply.com/v1/", "#").replace(".json", "");
                        console.log('categoryURL: ' + product_category_url);
                        var categorySingle = '<li><a href=' + product_category_url + '>' + el.name + '</a></li>';
                        product_category_list = product_category_list + categorySingle;
                      });
                      console.log (product_category_list);
                      $('#content-pane').html(
                        function() {
                          var productSingle = [
                          '<nav class="category-nav">', product_category_list,
                          '</nav><section class="product-details">',
                          '<a href=', product.buy_url,
                          ' target="_blank"><img src=', product.image,
                          '><br /><h2>', product.page_title,
                          '</h2>',
                          '</a><div class="product-details-content"> <a class="user-avatar" href="http://svpply.com/', product.user.id,
                          '" target="_blank"><img src=', product.user.avatar,
                          ' /><span class="user-name">', product.user.display_name,
                          '</span></a>',
                          '<ul class="product-details-list"><li><span class="price"><strong>Price: </strong>', product.price,
                          '</span></li>',
                          '<li><span class="saves"><strong>Saves: </strong>', product.saves,
                          '</span></li>',
                          '<li><span class="saves"><strong>Found at: </strong><a href=',product.store.url,
                          ' target="_blank">', product.store.name,
                          '</a></span></li></ul></div></section>'].join('');
                          return productSingle;
                        }

                      );
                      $('body').addClass('product-view').animate({ scrollTop: 0 }, "slow");
                  }
              });
          }
          else if (routerLocation == 'fullAction'){
        //  Trigger initial response for categories.
              $.ajax({
                  url:pageUrl,
                  dataType:'jsonp',
                  success:function (data) {
                    console.log('fullAction');
                      //Once we receive the data, set it to the content pane.
                      // console.log(data);
                      // console.log(data.response.product.page_title);
                      // Doin' it wrong.  Need to make a model to contain Product, then a collection.
                      $('body').addClass('nav' + categoryList);
                      var category = { 
                        products: data.response.products,
                        total_products: data.response.total_products                              
                      };
                      var product_list = '';
                      category.products.forEach(
                      function (el, i) {
                        var productSingle = [
                        '<li><a href=#products/', el.id,
                        '><img src=', el.image,
                        ' /><span class="page-title">', el.page_title,
                        '</span></a> <a class="user-avatar" href="http://svpply.com/', el.user.id,
                        '" target="_blank"><img src=', el.user.avatar,
                        ' /><span class="user-name">', el.user.display_name, 
                        '</span></a> </li>'].join('');
                        product_list = product_list + productSingle;
                      });
                      // console.log (product_list);
                      $('#content-pane').html(
                        function() {
                        var productSingle = [
                        '<section class="category-contents"><span class="total-products">Total Products: <strong>', category.total_products,
                        '</strong></span><ul class="category-list">', product_list,
                        '</ul></section>'
                        ].join('');
                          return productSingle;
                        }

                      );
                  }
              });

          }
          else if (routerLocation == 'loginAction'){
            $('#content-pane').html('login Action');
          }
          else {
            $('#content-pane').html('oops');
          };
        }
    });

    new restfulApp;
    //Initiate a new history and controller class
    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;
    Backbone.history.start();
})(jQuery);
