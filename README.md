# express-后端部分
#这里是项目后端部分，线上网站地址目前为http://212.64.17.157/home

#前端文件地址https://github.com/zjzswqzyy/vue-SPA

# 如何运行

在当前目录cmd命令行 npm install 安装依赖
下载mongodb数据库，把goods.json文件导入数据库（此文件为商品数据库的静态文件）
在/bin 目录下面找到www，在命令行输入node www，运行项目，如果cmd出现successful则后端启动

#注：本地端口为：3000，运行node须安装node.js。

# 文件解析
bin文件夹中为启动文件

models为mongodb数据库表属性配置

public为公共文件，此项目中后端仅提供数据接口，不采用

routes为后端接口文件，每个js中都有接口注释

util文件中的js为年月日格式化文件

app为入口

goods.json为数据库商品表静态数据。
