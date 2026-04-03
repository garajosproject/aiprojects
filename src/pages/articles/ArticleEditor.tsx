import { useState } from 'react'
import { Input, Button, Select, Upload } from 'antd'
import {
  FileTextOutlined, SaveOutlined, EyeOutlined, UploadOutlined,
  BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined,
} from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { articles } from '../../data/mock'

const { TextArea } = Input

export default function ArticleEditor() {
  const { id } = useParams()
  const existing = id ? articles.find(a => a.id === id) : null
  const isEdit = !!existing

  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState('')

  const breadcrumb = (
    <div className="flex items-center gap-1 text-sm text-gray-500">
      <FileTextOutlined />
      <Link to="/articles" className="hover:underline">Article</Link>
      <span>›</span>
      <FileTextOutlined className="text-gray-400" />
      <span className="text-gray-700 font-medium">{isEdit ? 'Edit Article' : 'New Article'}</span>
    </div>
  )

  return (
    <div>
      <Header title="" showSearch={false} />
      <div className="p-6">
        <div className="mb-4">{breadcrumb}</div>

        {/* Editor header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-800">Write Article</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Last Edit · 30 Sep 2022</span>
            <Button icon={<SaveOutlined />} className="rounded-lg text-sm">Save Draft</Button>
            <Button type="primary" icon={<EyeOutlined />} className="rounded-lg text-sm">Publish Live</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Title */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-red-500 font-medium">*Title</label>
              <span className="text-xs text-gray-400">{title.length}/120</span>
            </div>
            <Input
              placeholder="Topic or Headline of Article"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 120))}
              className="rounded-lg"
            />
          </div>

          {/* Category + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-red-500 font-medium block mb-1">*Select Category</label>
              <Select
                placeholder="Select Category from Dropdown"
                className="w-full"
                options={[
                  { value: 'food-series', label: 'Food Series' },
                  { value: 'fact-check', label: 'Fact Check' },
                  { value: 'evidence-based', label: 'Evidence Based' },
                  { value: 'nutrition', label: 'Nutrition' },
                  { value: 'expert-advice', label: 'Expert Advice' },
                ]}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-red-500 font-medium">*Add Tags</label>
                <span className="text-xs text-gray-400">Minimum 3 Tags</span>
              </div>
              <Select
                mode="tags"
                placeholder="Search and Add Tags"
                className="w-full"
              />
            </div>
          </div>

          {/* Body text */}
          <div>
            <label className="text-xs text-red-500 font-medium block mb-1">*Body Text</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
                <Select size="small" defaultValue="Font" style={{ width: 80 }} options={[{ value: 'Font', label: 'Font' }]} />
                <Select size="small" defaultValue="Regular" style={{ width: 80 }} options={[{ value: 'Regular', label: 'Regular' }]} />
                <Select size="small" defaultValue="12pt" style={{ width: 60 }} options={[{ value: '12pt', label: '12pt' }]} />
                <div className="h-4 w-px bg-gray-200" />
                <button className="p-1 hover:bg-gray-200 rounded"><BoldOutlined /></button>
                <button className="p-1 hover:bg-gray-200 rounded"><ItalicOutlined /></button>
                <button className="p-1 hover:bg-gray-200 rounded"><StrikethroughOutlined /></button>
                <button className="p-1 hover:bg-gray-200 rounded"><UnderlineOutlined /></button>
              </div>
              <TextArea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder=""
                autoSize={{ minRows: 10 }}
                className="border-none rounded-none"
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          {/* Banner image */}
          <div>
            <label className="text-xs text-red-500 font-medium block mb-1">
              *Banner Image <span className="text-gray-400 font-normal">(2:1 Ratio, Ex Dimension 1200 × 600, Upto 1MB)</span>
            </label>
            <Upload.Dragger className="rounded-lg">
              <div className="py-6">
                <UploadOutlined className="text-2xl text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-600">Upload files</p>
                <p className="text-xs text-gray-400">
                  Drop files directly here or <span className="text-blue-500 underline cursor-pointer">browse</span> from your device
                </p>
              </div>
            </Upload.Dragger>
          </div>
        </div>

        {/* Publish button */}
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="large"
          block
          className="mt-4 rounded-lg font-medium"
          style={{ height: 48 }}
        >
          Publish Article
        </Button>
      </div>
    </div>
  )
}
