var Models    = require('../database/models'), Users = Models.Users, Bookmarks = Models.Bookmarks;
var validUrl  = require('valid-url');
var Sequelize = require('sequelize');
var api;

function BookmarkApi() {
    api = this;
}

BookmarkApi.prototype.getRootFolder = (req, res, next) => {
    var session = req.session;
    var userId = session.uid;

    if (session.folderId) next();

    Bookmarks.find({where: {userId: userId, name: 'root'}}).then((root) => {
        session.rootId = root.id;
        next();
    }).catch((error)=> res.status(500).json({message: error.message})); // TODO Need version for post back
    
};

BookmarkApi.prototype.getList = (req, res) => {
    var search   = req.query['search'] ? req.query.search : undefined;
    var folderId = req.query['folderId'] ? req.query.folderId : req.session.folderId ? req.session.folderId : req.session.rootId;
    var sortBy   = req.query['sortBy'] ? req.query.sortBy : req.session.sortBy ? req.session.sortBy : 'name';

    req.session.folderId = folderId;
    req.session.sortBy   = sortBy;

    var uid = req.session.uid;

    var bookmarks = {
        where: {
            folderId: folderId,
            userId: uid
        },
        order: [[sortBy, 'ASC']]
    };

    if (search)
    {
        bookmarks.where.name = {
            $like: search
        }
    }

    var query = Bookmarks.findAll(bookmarks);

    query.then((list) => res.json(list));

    query.catch((error) => res.status(500).json({message: error.message}));
};

BookmarkApi.prototype.create = (req, res) => {
    var newBookmark      = req.body;
    newBookmark.favorite = 0;
    newBookmark.userId   = req.session.uid;
    // var validation       = api.validate(newBookmark);
    // if (!validation.isValid)
    // {
    //     return res.status(403).json(validation);
    // }

    var create = Bookmarks.create(newBookmark);

    create.then(()=> res.status(204).send());

    create.catch((error) => {
        console.log(error);

        if (error.name === 'SequelizeUniqueConstraintError')
        {
            res.status(409).json({type: error.message, message: error.errors[0].message});
        }

        res.status(403).json({type: error.message, message: error.errors[0].message});
    });
};

BookmarkApi.prototype.update = (req, res) => {
    var bookmark    = req.body;
    var id          = parseInt(req.params.bookId);
    bookmark.userId = req.session.uid;
    // var validation  = api.validate(bookmark);
    //
    // if (!validation.isValid)
    // {
    //     return res.status(404).json(validation);
    // }

    var update = Bookmarks.update(bookmark, {where: {id: id}});

    update.then((updated) => {
        console.log(updated);
        if (!updated[0])
        {
            return res.status(404).json({message: `Bookmark with ${id} not found`});
        }
        res.status(204).send();
    });

    update.catch((error) => {
        res.status(500).json({message: error.message})
    });
};

BookmarkApi.prototype.delete = (req, res) => {
    var id     = parseInt(req.params.bookId);
    var userId = req.session.uid;

    var destroy = Bookmarks.destroy({where: {id: id, userId: userId}});

    destroy.then((count) => {
        if (count < 1)
        {
            return res.status(404).json({message: `Bookmark with ${id} not found`});
        }

        res.status(204).send();
    });

    destroy.catch((error) => {
        res.status(500).json({message: error.message})
    });

};

BookmarkApi.prototype.validate = (bookmark) => {
    var validation = {isValid: true};
    if (bookmark.url && !validUrl.isUri(bookmark.url))
    {
        validation.isValid = false;
        validation.message = `Uri ${bookmark.uri} is not a valid URI`;
        return validation;
    }

    return validation;
};

module.exports = new BookmarkApi();