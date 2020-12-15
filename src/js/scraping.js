import axios from 'axios';
import cheerio from 'cheerio';

// State
const data = {
  origins: [
    {
      title: '中华人民共和国应急管理部-征求意见',
      link: 'http://www.mem.gov.cn/hd/zqyj/',
      site: 'http://www.mem.gov.cn/',
      selector: '.tonglan_list li',
    },
    {
      title: '中华人民共和国生态环境部-部文件',
      link: 'http://www.mee.gov.cn/zcwj/bwj/',
      site: 'http://www.mee.gov.cn/',
      selector: '.bd li'
    }
  ],
  resources: []
}

// Component
const Component = (function() {
  const Constructor = function(selector, options) {
    this.selector = selector;
    this.data = options.data;
    this.template = options.template;
  }

  Constructor.prototype.render = function() {
    const target = document.querySelector(this.selector);
    if (!target) return;
    target.innerHTML = this.template(this.data);
  }

  Constructor.prototype.getData = function() {
    return Object.parse(Object.stringify(this.data));
  }

  Constructor.prototype.setData = function(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.data[key] = obj[key];
      }
    }

    this.render();
  }

  return Constructor
})();

// Helper function
const getText = function(node, elem) {
  return node.children(elem).text();
}

const getAttr = function({node, property, regx, str}) {
  return node.attr(property).replace(regx, str);
}

const createItem = function(resource) {
  return `
    <li>
      <a href="${resource.href}">${resource.title}</a>
      <span>${resource.time}</span>
    </li>`
}
// template
const template = function(data) {
  if (data.resources.length < 1) {
    return '<p>Please wait ...</p>'
  }

  return `
    <ul>
      ${data.resources.map(resource => createItem(resource)).join('')}
    </ul>
  `
}

data.origins.forEach(origin => {
// Async
axios.get(`https://cors-anywhere.herokuapp.com/${origin.link}`)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    $(`${origin.selector}`).each(function(i, elem) {
      data.resources.push({
        title: getText($(elem), 'a'),
        time: getText($(elem), 'span'),
        href: getAttr({
          node: $(elem).children('a'),
          property: 'href',
          regx: /..\/..\//g,
          str: `${origin.site}`
        }),
        origin: `${origin.title}`
      })
    });

    const lists = new Component('#lists', {
      template: template,
      data: data
    })

    lists.render();

  })
  .catch(error => {
    console.log(error);
  })

})


