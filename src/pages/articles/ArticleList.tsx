import { useState } from 'react'
import { Button, Checkbox } from 'antd'
import { FilterOutlined, EyeOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import Header from '../../components/layout/Header'
import StatusBadge from '../../components/ui/StatusBadge'
import TabBar from '../../components/ui/TabBar'
import { articles, type Article } from '../../data/mock'

function ArticleRow({ article }: { article: Article }) {
  return (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <Checkbox />
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
      </div>

      {/* Article info */}
      <div className="flex-1 min-w-0">
        <Link to={`/articles/${article.id}`} className="text-sm font-semibold text-brand-blue hover:underline line-clamp-1">
          {article.title}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{article.excerpt}</p>
      </div>

      {/* Status + meta */}
      <div className="w-44 flex-shrink-0">
        <StatusBadge status={article.status} />
        <p className="text-xs text-gray-400 mt-1">By {article.author}</p>
        <p className="text-xs text-gray-400">Published on · {article.publishedDate}</p>
        <p className="text-xs text-gray-400">Last Edit · {article.lastEdit}</p>
      </div>

      {/* Category + views */}
      <div className="w-32 flex-shrink-0 text-right">
        <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{article.category}</span>
        <div className="flex items-center justify-end gap-1 mt-1">
          <EyeOutlined className="text-gray-400 text-xs" />
          <span className="text-xs text-gray-400">Views · {article.views.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default function ArticleList() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered: Article[] = activeTab === 'all'
    ? articles
    : activeTab === 'live'
    ? articles.filter(a => a.status === 'Live')
    : activeTab === 'draft'
    ? articles.filter(a => a.status === 'Draft')
    : articles.filter(a => a.status === 'Unpublished')

  return (
    <div>
      <Header
        title="Article"
        icon={<FileTextOutlined />}
        searchPlaceholder="Search article by category/topic/author"
        showSearch
      />
      <div className="p-6">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Checkbox />
            <Button icon={<FilterOutlined />} className="rounded-lg text-sm">Apply Filter</Button>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-lg text-sm text-gray-500">Unpublished</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="rounded-lg text-sm"
            >
              <Link to="/articles/new" className="text-white">New Article</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4">
            <TabBar
              activeKey={activeTab}
              onChange={setActiveTab}
              tabs={[
                { key: 'all',         label: `All Articles (${articles.length})` },
                { key: 'live',        label: `Live (${articles.filter(a => a.status === 'Live').length})` },
                { key: 'draft',       label: `Draft (${articles.filter(a => a.status === 'Draft').length})` },
                { key: 'unpublished', label: `Unpublished (${articles.filter(a => a.status === 'Unpublished').length})` },
              ]}
            />
          </div>
          {filtered.map(article => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
