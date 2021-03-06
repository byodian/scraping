import axios from 'axios';
import cheerio from 'cheerio';
import Component from './model/Component';

// State
const data = {
  origins: [
    {
      title: '中华人民共和国应急管理部-征求意见',
      url: 'http://www.mem.gov.cn/hd/zqyj/',
      host: 'http://www.mem.gov.cn/',
      selector: '.tonglan_list li',
      children: ['a', 'span'],
      parent: '#list1',
      id: 0
    },
    {
      title: '中华人民共和国应急管理部-法律法规标准',
      url: 'http://www.mem.gov.cn/fw/flfgbz/',
      host: 'http://www.mem.gov.cn/',
      selector: '.tonglan_list li',
      children: ['a', 'span'],
      parent: '#list2',
      id: 1
    },
    {
      title: '中华人民共和国生态环境部-部文件',
      url: 'http://www.mee.gov.cn/zcwj/bwj/',
      host: 'http://www.mee.gov.cn/',
      selector: '.bd li',
      children: ['a', 'span'],
      parent: '#list3',
      id: 2
    },
    {
      title: '中国政府网-最新政策', 
      url: 'http://www.gov.cn/zhengce/zuixin.htm',
      host: 'http://www.gov.cn/',
      selector: '.news_box h4',
      children: ['a', 'span'],
      parent: '#list4',
      id: 3
    }, 
    {
      title: '中国人民共和国司法部-法律', 
      url: 'http://www.moj.gov.cn/Department/node_592.html',
      host: 'http://www.moj.gov.cn/',
      selector: '.news_list li',
      children: ['dt', 'dd'],
      parent: '#list5',
      id: 4
    },
    {
      title: '中国人民共和国司法部-行政法规', 
      url: 'http://www.moj.gov.cn/government_public/node_593.html',
      host: 'http://www.moj.gov.cn/',
      selector: '.news_list li',
      children: ['dt', 'dd'],
      parent: '#list6',
      id: 5
    },
  ],
  resources: {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  }
}

// Helper function
const helper = {
  getText: (node, elem) => helper.trim(node.find(elem).text()),
  getDate: (node, elem) => helper.trim(node.find(elem).text(), / \d{2}:\d{2}$/),
  getHref: ({ node, origin }) => {
    const href = node.find('a').attr('href');
    if (/^..\/..\//.test(href)) {
      return href.replace(/^..\/..\//, origin.host);
    } 

    if (/^\//.test(href)) {
      return href.replace(/^\//, origin.host);
    }
    
    if (/^.\//.test(href)) {
      return href.replace(/.\//, origin.url);
    } 

    return href;
  },
  trim: (str, regx = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/) => str.replace(regx, ''),
  createItem: resource => (`
      <li>
        <a href="${resource.href}">${resource.title}</a>
        <span>${resource.time}</span>
      </li>
  `),
  template: (data, origin) => {
    if (data.resources[origin.id].length < 1) {
      return '<p>Please wait ...</p>'
    }

    return `
      <h2>${origin.title}</h2>
      <ul>
        ${data.resources[origin.id].map(resource => helper.createItem(resource)).join('')}
      </ul>
    `
  }
}

const scrapDate = function(count = 6) {
  data.origins.forEach(origin => {
  axios.get(`https://cors-anywhere.herokuapp.com/${origin.url}`)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);

        $(`${origin.selector}`).each(function(i, elem) {

          if (i >= count) return;
          data.resources[origin.id].push({
            title: helper.getText($(elem), `${origin.children[0]}`),
            time: helper.getDate($(elem), `${origin.children[1]}`),
            href: helper.getHref({
              node: $(elem),
              origin: origin
            })
          })
        });

        const lists = new Component(`${origin.parent}`, {
          template: helper.template,
          data: data,
          origin: origin,
        })

        lists.render();
      })
    .catch(error => {
      console.log(error);
    })
  })
}

scrapDate()
