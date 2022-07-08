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

const getCategories = ()=>{return Object.keys(fileStore.channels.get()??{})};

//const categories = getCategories();


const getCount = (type, allType)=> (category)=>{
    if (!category) return fileStore[allType].get('all')?.length ?? 0;
    else return fileStore[type].get(category)?.length ?? 0;
}

const getCategoriesWithCountStr = (type, allType)=>()=>{
    const categories = getCategories();
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
    const categories = getCategories();

    return categories.reduce((prev, cur)=>{
            prev[cur] = {count: fileStore[type].get(cur)?.length ?? 0}
            return prev;
        }, {})
}

const getCategoriesWithCountKbStr = (type, allType)=>()=>{
    const categories = getCategories();
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
        addCategory:(name)=>{
            channels.set(name, [])
            chats.set(name, [])
        },
        addLink: (category, link)=>{
            if (!category) allChannels.append('all',link);
            channels.append(category,link)
        },
        clear: ()=>{channels.empty();},
        getCategories,
        importCategoryArray: importCategoryArray('channels', 'allChannels')
    },
    addCategory:(name)=>{
        channels.set(name, [])
        chats.set(name, [])
    },
    chats: {
        getRandomLink: getRandomLink('chats', 'allChats'),
        getCount: getCount('chats', 'allChats'),
        getCategoriesWithCount: getCategoriesWithCount('chats', 'allChats'),
        getCategoriesWithCountStr: getCategoriesWithCountStr('chats', 'allChats'),
        getCategoriesWithCountKbStr: getCategoriesWithCountKbStr('chats', 'allChats'),
        addCategory:(name)=>{
            channels.set(name, [])
            chats.set(name, [])
        },
        clear: ()=>{chats.empty();},
        getCategories,
        importCategoryArray: importCategoryArray('chats', 'allChats'),
    },
    bots: {
        getRandomLink: getRandomLink('bots', 'allBots'),
        getCount: getCount('bots', 'allBots'),
        importArray: importCategoryArray('bots', 'allBots'),

    },
    
    
    
    getCategories,
    deleteCategory:(category)=>{
        channels.set(category,undefined)
        chats.set(category,undefined)
    },


    


    
}