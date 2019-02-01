

var APP = (function () {
    let reviews = [];
    let picTaken = false; 
    let stars = document.querySelectorAll('.star'); 
    let review = {};
    let appPath;

    
    function genrateList() {
        let list = document.getElementById('list-page');
        if (localStorage.length == 0) {
            list.innerHTML = "";
            messageFun('empty');
        } else {
            list.innerHTML = "";
            reviews = []; 
            for (let i = 0, keyindex, len = localStorage.length; i < len; i++) {
                keyindex = localStorage.key(i);
                reviews.push(JSON.parse(localStorage[keyindex]));
            }
            list.appendChild(listBuilder(reviews));
        }
    }

    function listBuilder(arr) {
        let ul = document.createElement('ul');
        ul.classList.add('list-view');
        arr.forEach((rev) => {
            let li = document.createElement('li');
            li.classList.add('list-item');
            li.setAttribute('id', rev.id);
            let img = document.createElement('img');
            img.src = rev.img;
            img.alt = `A review picture`;
            li.appendChild(img);
            let p = document.createElement('p');
            p.textContent = `${rev.description}`;
            li.appendChild(p);
            let rating = rev.rating;
            let ratingdiv = document.createElement('div');
            while (rating > 0) {
                let starspan = document.createElement('span');
                starspan.classList.add('star');
                starspan.classList.add('rated');
                ratingdiv.appendChild(starspan);
                rating--;
            }
            li.appendChild(ratingdiv);
            let span = document.createElement('span');
            span.classList.add('action-right');
            span.classList.add('icon');
            span.classList.add('arrow_right');
            span.id = 'itemid';
            span.addEventListener('click', navigation);
            li.appendChild(span);
            ul.appendChild(li);
        });
        return ul;
    }

    function takePicture() {
        let opts = {
            quality: 45,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            mediaType: Camera.MediaType.PICTURE,
            encodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK,
            allowEdit: true,
            targetWidth: 300,
            targetHeight: 300
        };
        navigationigator.camera.getPicture((imgURI) => {
            document.getElementById('img').src = imgURI;
            picTaken = true;
        }, fail, opts);
    }

    function fail(err) {
        console.log(err);
        messageFun('error');
    }

    function saveReview() {
        review.id = Date.now();
        review.img = document.getElementById('img').getAttribute('src');
        review.description = document.getElementById('desc').value;
        review.rating = document.querySelector('.stars').getAttribute('data-rating');
        localStorage.setItem(review.id, JSON.stringify(review));
        //Save IMG to permament folder
        window.resolveLocalFileSystemURL(review.img, moveToPerm, fail);
    }

    function moveToPerm(entry) {
        let imgName = review.id + ".jpg";
        entry.copyTo(appPath, imgName, (file) => {
            review.img = file.nativeURL;
            window.cordova.plugins.imagesaver.saveImageToGallery(file.nativeURL, () => {
                console.log("Image saved to Gallery");
            }, fail);
            localStorage.setItem(review.id, JSON.stringify(review));
        }, fail);
    }

    function deleteFromPerm (id) {
        let imgName = id + ".jpg";
        window.resolveLocalFileSystemURL(appPath.nativeURL, function(dir){
            //console.log(dir);
            dir.getFile(imgName, {create:false}, function(fileEntry){
                fileEntry.remove(function(){
                    console.log("Deleted");
                }, fail, fail);
            }, fail);
        }, fail);
    }

    function genDetail(lsID) {
        let detail = document.getElementById('detail');
        detail.innerHTML = "";
        let review = JSON.parse(localStorage[lsID]);
        let card = document.createElement('div');
        card.setAttribute('id', review.id);
        card.classList.add('card');
        card.classList.add('fixed');
        let img = document.createElement('img');
        img.src = review.img;
        img.alt = "A Review Picture";
        img.classList.add("round")
        card.appendChild(img);
        let rating = review.rating;
        let ratingdiv = document.createElement('div');
        ratingdiv.classList.add('center');
        while (rating > 0) {
            let starspan = document.createElement('span');
            starspan.classList.add('star');
            starspan.classList.add('rated');
            ratingdiv.appendChild(starspan);
            rating--;
        }
        card.appendChild(ratingdiv);
        let p = document.createElement('p');
        p.textContent = review.description;
        card.appendChild(p);
        detail.appendChild(card);
    }

    function messageFun(scope) {
        let overlay = document.querySelector('.overlay-bars');
        switch (scope) {
            case 'save':
                document.querySelector('.info').innerHTML = "Review Saved";
                break;
            case 'delete':
                document.querySelector('.info').innerHTML = "Review Deleted";
                break;
            case 'empty':
                document.querySelector('.info').innerHTML = "No review found. Add one.";
                break;
            case 'takePicture':
                document.querySelector('.info').innerHTML = "picture needed.";
                break;
            case 'error':
                document.querySelector('.info').innerHTML = "opps.....!!! error";
        }
        overlay.classList.add('active');
        if (scope == 'empty') {
             overlay.classList.remove('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    function navigation(ev) {
        let listPage = document.getElementById('list-page');
        let addPage = document.getElementById('add-page');
        let detailPage = document.getElementById('detail-page');
        let headerPage = document.getElementById('headeradd');
        
        switch (ev.target.id) {
            case 'add':
                clearFields();
                stars[0].dispatchEvent(new MouseEvent('click'));
                addPage.classList.add('active');
                listPage.classList.remove('active');
                break;
            case 'itemid':
                genDetail(ev.target.parentElement.getAttribute('id'));
                detailPage.classList.add('active');
                listPage.classList.remove('active');
                break;
            case 'save':
                if (picTaken && document.getElementById('desc').value.length > 0) {
                    saveReview();
                    genrateList();
                    messageFun('save');
                    listPage.classList.add('active');
                    addPage.classList.remove('active');
                } else {
                    messageFun('takePicture');
                }
                break;
            case 'delete':
                deleteFromPerm(document.querySelector('.card').getAttribute('id'));
                localStorage.removeItem(document.querySelector('.card').getAttribute('id'));
                messageFun('delete');
                genrateList();
            default:
                listPage.classList.add('active');
                addPage.classList.remove('active');
                detailPage.classList.remove('active');
                headerPage.classList.remove('active');

                
        }
    }

    function clearFields() {
        document.getElementById('desc').value = "";
        document.querySelector('.stars').setAttribute('data-rating', 1);
        document.getElementById('img').src = "";
        picTaken = false;
    }

    function setRating(ev) {
        let span = ev.currentTarget;
        let match = false;
        let num = 0;
        stars.forEach(function (star, index) {
            if (match) {
                star.classList.remove('rated');
            } else {
                star.classList.add('rated');
            }
            if (star === span) {
                match = true;
                num = index + 1;
            }
        });
        document.querySelector('.stars').setAttribute('data-rating', num);
    }
    function init() {
        document.getElementById('add').addEventListener('click', navigation);
        document.getElementById('save').addEventListener('click', navigation);
        document.getElementById('cancel').addEventListener('click', navigation);
        document.getElementById('back').addEventListener('click', navigation);
        document.getElementById('delete').addEventListener('click', navigation);
        document.getElementById('picture').addEventListener('click', takePicture);
        stars.forEach(function (star) {
            star.addEventListener('click', setRating);
        });
        genrateList();
    }
    document.addEventListener('deviceready', init);

})();