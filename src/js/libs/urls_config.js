/**
 * Created by pc on 13-12-23.
 */
define(function(){
    return {
        online:{
            onlineMust : 'http://store.liebao.cn/manage/index.php?r=extension/getlist&cat=3',
            slider:'http://store.liebao.cn/manage/index.php?r=extension/getheadimg',
            recommend:'http://store.liebao.cn/manage/index.php?r=extension/getlist&cat=2',
            download:'http://store.liebao.cn/manage/index.php?r=extension/getlist&cat=1',
            newadd:'data/download.json',
            //排行
            topRank:'http://store.liebao.cn/manage/index.php?r=extension/getsidelist',
            //分类
            cat:'http://store.liebao.cn/manage/index.php?r=extension/getlist&type=',
            getCats:'http://store.liebao.cn/manage/index.php?r=extension/getSorts',
            //主页右侧：最新下载及周排行
            mainSide:'http://store.liebao.cn/manage/index.php?r=extension/getsidelist&num=10',
            //专题分类
            subject:'http://store.liebao.cn/manage/index.php?r=extension/getsubjectlist',
            search:'http://store.liebao.cn/manage/index.php?r=extension/getSearchlist&keyword='
        },
        offline:{
            onlineMust : 'data/index.json',
            recommend:'data/reco.json',
            download:'data/download.json',
            newadd:'data/download.json',
            topRank:'data/toprank.json',
            cat:'data/advFilter.json',
            mainSide:'data/mainSide.json',
            slider:'data/slider.json',
            subject:'data/zt.json',
            search:'data/search.json?keyword=',
            getCats:'data/getCats.json?type='
        },
        //是否线下，用于调试
        offlineStatus:false
    };
});
