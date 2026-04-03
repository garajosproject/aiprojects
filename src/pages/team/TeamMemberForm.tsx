import { Input, Button, Select, Upload } from 'antd'
import { TeamOutlined, UploadOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { teamMembers } from '../../data/mock'

export default function TeamMemberForm() {
  const { id } = useParams()
  const existing = id && id !== 'new' ? teamMembers.find(m => m.id === id) : null
  const isEdit = !!existing

  const breadcrumb = (
    <div className="flex items-center gap-1 text-sm text-gray-500">
      <TeamOutlined />
      <Link to="/team" className="hover:underline">Team</Link>
      <span>›</span>
      <TeamOutlined className="text-gray-400" />
      <span className="text-gray-700 font-medium">{isEdit ? 'Edit Profile' : 'Add Team Member'}</span>
    </div>
  )

  return (
    <div>
      <Header title="" showSearch={false} />
      <div className="p-6">
        <div className="mb-4">{breadcrumb}</div>
        <h2 className="text-base font-semibold text-gray-800 mb-5">
          {isEdit ? 'Edit Profile' : 'Create Profile'}
        </h2>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {/* Basic Info */}
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Basic Info</h3>

              <div>
                <label className="text-xs text-red-500 font-medium block mb-1">*Name</label>
                <Input
                  placeholder="Enter Full Name"
                  defaultValue={existing?.name ?? ''}
                  className="rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-red-500 font-medium block mb-1">*Role in Team</label>
                  <Select
                    placeholder="Select Role"
                    className="w-full"
                    defaultValue={existing?.role}
                    options={[
                      { value: 'Super Admin', label: 'Super Admin' },
                      { value: 'Admin', label: 'Admin' },
                      { value: 'Doctor', label: 'Doctor' },
                      { value: 'Health Coach', label: 'Health Coach' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-xs text-red-500 font-medium block mb-1">*Status</label>
                  <Select
                    placeholder="Account Status"
                    className="w-full"
                    defaultValue={existing?.status}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'In Active', label: 'In Active' },
                      { value: 'Busy', label: 'Busy' },
                      { value: 'On leave', label: 'On leave' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-red-500 font-medium block mb-1">*Mobile No.</label>
                  <Input
                    placeholder="Enter 10 Digit Mobile Number"
                    defaultValue={existing?.phone}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-red-500 font-medium block mb-1">*Email Address</label>
                  <Input
                    placeholder="Enter Email Address"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Profile photo */}
            <div className="flex flex-col items-center gap-3 w-40 flex-shrink-0">
              <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center">
                Drop Profile Photo
              </div>
              <Upload showUploadList={false}>
                <Button icon={<UploadOutlined />} className="rounded-lg text-xs">Upload</Button>
              </Upload>
            </div>
          </div>

          <div className="border-t border-gray-100 my-6" />

          {/* Other Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Other Details</h3>

            <div>
              <label className="text-xs text-red-500 font-medium block mb-1">*Short Intro</label>
              <Input
                placeholder="Short information about team member"
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-red-500 font-medium block mb-1">*Select Gender</label>
                <Select
                  placeholder="Select Gender"
                  className="w-full"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>
              <div>
                <label className="text-xs text-red-500 font-medium block mb-1">*Add Language</label>
                <Select
                  mode="tags"
                  placeholder="Add Known Languages"
                  className="w-full"
                  defaultValue={existing?.languages}
                  options={[
                    { value: 'Hindi', label: 'Hindi' },
                    { value: 'English', label: 'English' },
                    { value: 'Marathi', label: 'Marathi' },
                    { value: 'Gujarati', label: 'Gujarati' },
                    { value: 'Tamil', label: 'Tamil' },
                    { value: 'Telugu', label: 'Telugu' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          block
          className="mt-4 rounded-lg font-medium"
          style={{ height: 48, background: '#e5e7eb', color: '#9ca3af', border: 'none' }}
        >
          Save Details
        </Button>
      </div>
    </div>
  )
}
