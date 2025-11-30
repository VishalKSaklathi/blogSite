import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import TextEditor from './textEditor/text-editor'
import Blogs from './blogs'
import ViewBlog from './viewBlog'

function DashboardContent() {
  return (
    <div>
      <Routes>
        {/* BLOGS SECTION */}
        <Route path="blogs">
          <Route index element={<Blogs />} />
          <Route path=":id" element={<ViewBlog />} /> {/* /dashboard/blogs/:id */}
        </Route>
        <Route path="blogs/category/:categorySlug" element={<Blogs />} />

        {/* CREATE BLOG */}
        <Route path="create-blog" element={<TextEditor />} />
      </Routes>
    </div>
  )
}

export default DashboardContent