const editJsonFile = require("edit-json-file");
const Category = require("./db/entity/Category");

const fileStore = {
    channels:editJsonFile(`channels.json`, {
        autosave: true
    }),
    allChannels:editJsonFile(`allChannels.json`, {
        autosave: true
    }),

    chats:editJsonFile(`chats.json`, {
        autosave: true
    }),
    allChats:editJsonFile(`allChats.json`, {
        autosave: true
    }),

    allBots:editJsonFile(`allBots.json`, {
        autosave: true
    }),
}


function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

const getCategories = (type)=>()=>{return Object.keys(fileStore?.[type].get()??{})};

//const categories = getCategories();


const getCount = (type, allType)=> (category)=>{
    if (!category) return fileStore[allType].get('all')?.length ?? 0;
    else return fileStore[type].get(category)?.length ?? 0;
}

const getCategoriesWithCountStr = (type, allType)=>()=>{
    const categories = getCategories(type)();
    const an = type==='chats' ? "Все чаты " : 'Все каналы ';

    return [an+getCount(type, allType)(), ...categories.reduce((prev, cur)=>{
        prev.push(`${cur} ${fileStore[type].get(cur)?.length ?? 0}`)
        return prev;
    }, [])]
}

function SortArray(name,name2){
    if (name < name2  ) {return -1;}
    if (name > name2 || name2?.substring(0, name.lastIndexOf(' ')==='Все каналы')) {return 1;}
    return 0;
}

const getCategoriesWithCount = (type)=>()=>{
    const categories = getCategories(type)();

    return categories.reduce((prev, cur)=>{
            prev[cur] = {count: fileStore[type].get(cur)?.length ?? 0}
            return prev;
        }, {})
}

const getCategoriesWithCountKbStr = (type, allType)=>()=>{
    const categories = getCategories(type)();
    const an = type==='chats' ? "Все чаты " : 'Все каналы ';
    return [an+getCount(type, allType)(), ...categories.reduce((prev, cur)=>{
        prev.push(`${cur} ${fileStore[type].get(cur)?.length ?? 0}`)
        return prev;
    }, [])?.sort(SortArray)]
}

const getRandomLink = (type, allType)=>(category)=>{

    let categoryLinks;
    if (!category) categoryLinks = fileStore[allType].get('all')
    else categoryLinks = fileStore[type].get(category)

    return categoryLinks?.[randomInteger(0,categoryLinks?.length-1)]
}

const importCategoryArray = (type, allType)=>(category, array)=>{

    if (!category) {return fileStore[allType].set('all',array)}
    fileStore[type].set(category,array)
}

module.exports = {

    channels: {
        getRandomLink: getRandomLink('channels', 'allChannels'),
        getCount: getCount('channels', 'allChannels'),
        getCategoriesWithCount: getCategoriesWithCount('channels', 'allChannels'),
        getCategoriesWithCountStr: getCategoriesWithCountStr('channels', 'allChannels'),
        getCategoriesWithCountKbStr: getCategoriesWithCountKbStr('channels', 'allChannels'),
        addLink: (category, link)=>{
            if (!category) fileStore.allChannels.append('all',link);
            fileStore.channels.append(category,link)
        },
        clear: ()=>{channels.empty();},
        getCategories: getCategories('channels'),
        importCategoryArray: importCategoryArray('channels', 'allChannels'),
        addCategory:(name)=>{
            fileStore.channels.set(name, [])
        },
        deleteCategory:(category)=>{
            fileStore.channels.set(category,undefined)
        },
    },
    
    chats: {
        getRandomLink: getRandomLink('chats', 'allChats'),
        getCount: getCount('chats', 'allChats'),
        getCategoriesWithCount: getCategoriesWithCount('chats', 'allChats'),
        getCategoriesWithCountStr: getCategoriesWithCountStr('chats', 'allChats'),
        getCategoriesWithCountKbStr: getCategoriesWithCountKbStr('chats', 'allChats'),
        clear: ()=>{fileStore.chats.empty();},
        getCategories: getCategories('chats'),
        importCategoryArray: importCategoryArray('chats', 'allChats'),
        addCategory:(name)=>{
            fileStore.chats.set(name, [])
        },
        addLink: (category, link)=>{
            if (!category) fileStore.allChats.append('all',link);
            fileStore.chats.append(category,link)
        },
        deleteCategory:(category)=>{
            fileStore.chats.set(category,undefined)
        },
    },
    bots: {
        getRandomLink: getRandomLink('bots', 'allBots'),
        getCount: getCount('bots', 'allBots'),
        importArray: importCategoryArray('bots', 'allBots'),

    },
    
}