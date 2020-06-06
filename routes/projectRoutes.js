const router = require('express').Router();
const Project = require('../models/Project');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/addProject', async function(req, res){
    let title = req.body.title;
    let description = req.body.description;
    let createdBy = req.user._id;
    let universities = req.body.universities;
    let minQual = req.body.minQual;
    let countries = req.body.countries;
    let minAge = req.body.minAge;
    let maxAge = req.body.maxAge;
    let skills = req.body.skills;

    let project = new Project({
        title: title,
        description: description,
        createdBy: createdBy,
        universities: universities,
        minQual: minQual,
        countries: countries,
        minAge: minAge,
        maxAge: maxAge,
        skills: skills
    });

    try{
        await project.save();
        req.user.myProjects.push(project._id);
        req.user.save();
        res.json({message: 'done', createdBy: req.user.username, id: project._id});
    }
    catch{
        res.json({message: 'Server Error, please try again later'});
    }
});

router.get('/search', async function(req, res){
    let tags = req.query.tags.split('+');
    if(tags[0] === ''){
        return res.json({projects: []});
    }else if(tags.length === 1){
        let tag0 = tags[0];
        try{
            let inter = await Project.find({$or: [{universities: tag0},
            {countries: tag0}, {skills: tag0}, {minQual: tag0}, {"title": {$regex: tag0, $options: 'i'}},
            {"description": {$regex: tag0, $options: 'i'}}]});
            let projects = [];
            for(i=0; i<inter.length; i++){
                let user = await User.findById(inter[i].createdBy);
                let createdBy = user.username;
                let project = {
                    title: inter[i].title,
                    createdBy: createdBy,
                    id: inter[i]._id
                };
                projects.push(project);
            }
            return res.json({projects: projects});
        } catch(e){
            console.log(e);
        }
    }else{
        let tag0 = tags[0];
        try{
            let inter = await Project.find({$or: [{universities: tag0},
            {countries: tag0}, {skills: tag0}, {minQual: tag0}, {"title": {$regex: tag0, $options: 'i'}},
            {"description": {$regex: tag0, $options: 'i'}}]});
            for(i=1; i<tags.length; i++){
                let tag = tags[i];
                let curr = await Project.find({$or: [{universities: tag},
                    {countries: tag}, {skills: tag}, {minQual: tag}, {"title": {$regex: tag, $options: 'i'}},
                    {"description": {$regex: tag, $options: 'i'}}]});
                let tmp = [...inter, ...curr];
                inter = tmp;
            }
            
            let uniqueObject = {}; 
               
            for (let i in inter) {  
                objId = inter[i]._id; 
                uniqueObject[objId] = inter[i]; 
            } 
              
            let newArray = [] 
            for (i in uniqueObject) { 
                newArray.push(uniqueObject[i]); 
            } 

            let projects = [];
            for(i=0; i<newArray.length; i++){
                let user = await User.findById(newArray[i].createdBy);
                let createdBy = user.username;
                let project = {
                    title: newArray[i].title,
                    createdBy: createdBy,
                    id: newArray[i]._id
                };
                projects.push(project);
            }
            return res.json({projects: projects});
        }catch(e){
            console.log(e);
        }
    }

});


router.post('/apply', async function(req, res){
    let priority = req.body.skillCheck;
    if(req.body.universityCheck){
        priority += 1;
    }
    if(req.body.qualCheck){
        priority += 1;
    }
    if(req.body.ageCheck){
        priority += 1;
    }
    if(req.body.countryCheck){
        priority += 1;
    }
    let member = {
        id: req.user._id,
        status: 'Not seen',
        priority: priority
    };
    try{
        let project = await Project.findById(req.body.project);
        project.members.push(member);
        req.user.myProjects.push(req.body.project);
        await project.save();
        await user.save();
        return res.json({message: 'done'});
    } catch{
        return res.json({message: 'Server Error, please try again later'});
    }
});

router.post('/changeStatus', async function(req, res){
    try{
        let project = await Project.findById(req.body.project);
        for(i=0; i<project.members.length; i++){
            if(project.members[i].id === req.body.id){
                project.members[i].status = req.body.newStatus;
                await project.save()
                return res.json({message: 'done'});
            }
        }
    } catch{
        return res.json({message: 'Server Error, please try again later'});
    }
});

router.post('/rate', async function(req, res){
    try{
        let rater = await bcrypt.hash(req.user.username, 10);
        let ratee = User.find({username: req.body.ratee});
        if(ratee.totRatings === 0){
            ratee.totRatings += 1;
            ratee.rating = req.body.rating;
            ratee.raters.push(rater);
            await ratee.save();
            return res.json({message: 'done'});
        }else{
            if(ratee.raters.some(ele => ele === rater)){
                return res.json({message: 'Already rated this user'});
            }else{
                let tmp = ratee.rating * ratee.totRatings;
                ratee.totRatings += 1;
                ratee.rating = (tmp + req.body.rating)/ratee.totRatings;
                ratee.raters.push(rater);
                await ratee.save();
                return res.json({message: 'done'});
            }
        }
    }catch{
        return res.json({message: 'Server Error, please try again later'});
    }
    
});

router.get('/getProjects', async function(req, res){
    try{
        let list = req.user.myProjects;
        let projects = [];
        for(i=0; i<list.length; i++){
            let tmp = await Project.findById(list[i]);
            let user = await User.findById(tmp.createdBy);
            let project = {title: tmp.title, createdBy: user.username, id: tmp._id};
            projects.push(project);
        }
        return res.json({projects: projects});
    } catch(e){
        console.log(e);
    }
});

router.get('/projectDetail', async function(req, res){
    try{
        let project = await Project.findById(req.body.project);
        //if user is owner
        if(project.createdBy === req.user._id){
            let members = [];
            for(i=0; i<project.members.length; i++){
                let user = await User.findById(project.members[i].id);
                let priority = project.members[i].priority;
                let rating = user.rating;
                members.push({username: user.username, priority: priority, rating: rating});
            }
            members.sort(function(a, b){return a.priority - b.priority});
            let details = {
                title: project.title,
                createdBy: project.createdBy,
                description: project.description,
                members: members
            };
            return res.json({message: 'done', details: details});
        }else{
            let status;
            for(i=0; i<project.members.length; i++){
                if(req.user._id === project.members[i].id){
                    status = project.members[i].status;
                    break;
                }
            }
            if(status === 'Accepted'){
                let members = [];
                for(i=0; i<project.members.length; i++){
                    let user = await User.findById(project.members[i].id);
                    members.push(user.username);
                }
                let details = {
                    title: project.title,
                    createdBy: project.createdBy,
                    description: project.description,
                    members: members
                };
                return res.json({message: 'Accepted', details: details});
            }else{
                return res.json({message: status});
            }
        }
    }catch{
        return res.json({message: 'Server Error, please try again later'});
    }
});

module.exports = router;