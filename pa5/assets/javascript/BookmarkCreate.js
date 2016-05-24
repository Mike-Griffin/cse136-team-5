(function () {
    var app            = this['App'];
    app.bookmarkCreate = new BookmarkCreate();

    
    
    /* Bookmark create */
    function BookmarkCreate() {
        
        this.template = app.templates['assets/templates/bm-create-dialog.hbs'];
        
    }

    BookmarkCreate.prototype.show = function showBookmarkCreate() {
        var folders = app.bookmarkExplorer.folders;
        var context = {'folders': folders};
        console.log('folders ', folders);
        app.show('bm-create-dialog', this.template, context);
    };

    BookmarkCreate.prototype.remove = function removeBookmarkCreate(event) {
        if (event)
        {
            event.preventDefault();
        }

        app.hide('bm-create-dialog');
    };

    BookmarkCreate.prototype.addBookmarkRequest = function addBookmarkRequest(event, element) {
        console.log("ADD BOOKMARK");
        var name        = element.form.name.value;
        var url         = element.form.url.value;
        var keywords    = element.form.keywords.value;
        var description = element.form.description.value;
        var folderId    = element.form.folderId.value;
        
        axios.post('/api/bookmarks/', {
                 name: name,
                 url: url,
                 keywords: keywords,
                 folderId: folderId,
                 description: description
             })
             .then(function (res) {
                 console.log(res);
                if(res.status == 204){
                    app.bookmarkExplorer.showBookmarks();
                    console.log("SUCCESFUL REQUEST");
                }

             })
             .catch(function (res) {
                 console.log(res);
                if(res.status == 401) {
                    window.location.href = '/';
                }
                var error = {
                    name: res.data.message,
                    code: res.status,
                    message: res.data.errors[0].message
                };
            
                App.errorDialog.show(error);
             });

        if (event)
        {
            event.preventDefault();
        }
        app.remove(event, element, 'bm-create-dialog');
    };

    BookmarkCreate.prototype.addFolderRequest = function addFolderRequest(event, element) {
        var name = element.form.name.value;
        var description = element.form.description.value;

        axios.post('/api/bookmarks/', {
                 name: name,
                 description: description
             })
             .then(function (res) {
                 console.log(res);
                 app.bookmarkExplorer.showBookmarks();
             })
             .catch(function (res) {
                 console.log(res);
                if(res.status == 401) {
                    window.location.href = '/';
                }

                var error = {
                    name: res.data.message,
                    code: res.status,
                    message: res.data.errors[0].message
                };
            
                App.errorDialog.show(error);
             });

        if (event)
        {
            event.preventDefault();
        }
        app.remove(event, element, 'bm-create-folder-dialog');
    }

})(window);
