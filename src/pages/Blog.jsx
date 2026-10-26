// src/pages/Blog.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImage } from '../utils/images';
import {
  blogPosts,
  blogCategories,
  popularPosts,
  blogArchives,
} from '../data/blog';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState(1);

  const filteredPosts = blogPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Title Page */}
      <section
        className="bg-title-page flex-c-m p-t-160 p-b-80 p-l-15 p-r-15"
        style={{ backgroundImage: `url(${getImage('bg-title-page-03.jpg')})` }}
      >
        <h2 className="tit6 t-center">Blog</h2>
      </section>

      {/* Content page */}
      <section>
        <div className="bread-crumb bo5-b p-t-17 p-b-17">
          <div className="container">
            <Link to="/" className="txt27">
              Home
            </Link>
            <span className="txt29 m-l-10 m-r-10">/</span>
            <span className="txt29">Blog</span>
          </div>
        </div>

        <div className="container">
          <div className="row">
            {/* Main Blog List */}
            <div className="col-md-8 col-lg-9">
              <div className="p-t-80 p-b-124 bo5-r h-full p-r-50 p-r-0-md bo-none-md">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="blo4 p-b-63">
                    <div className="pic-blo4 hov-img-zoom bo-rad-10 pos-relative">
                      <Link to={`/Blog/${post.id}`}>
                        <img src={getImage(post.image)} alt="IMG-BLOG" />
                      </Link>

                      <div className="date-blo4 flex-col-c-m">
                        <span className="txt30 m-b-4">{post.day}</span>
                        <span className="txt31">{post.monthYear}</span>
                      </div>
                    </div>

                    <div className="text-blo4 p-t-33">
                      <h4 className="p-b-16">
                        <Link to={`/Blog/${post.id}`} className="tit9">
                          {post.title}
                        </Link>
                      </h4>

                      <div className="txt32 flex-w p-b-24">
                        <span>
                          by {post.author}
                          <span className="m-r-6 m-l-4">|</span>
                        </span>

                        <span>
                          {post.dateFull}
                          <span className="m-r-6 m-l-4">|</span>
                        </span>

                        <span>
                          {post.tags}
                          <span className="m-r-6 m-l-4">|</span>
                        </span>

                        <span>{post.comments}</span>
                      </div>

                      <p>{post.excerpt}</p>

                      <Link to={`/Blog/${post.id}`} className="dis-block txt4 m-t-30">
                        Continue Reading
                        <i
                          className="fa fa-long-arrow-right m-l-10"
                          aria-hidden="true"
                        ></i>
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="pagination flex-l-m flex-w m-l--6 p-t-25">
                  <button
                    type="button"
                    className={`item-pagination flex-c-m trans-0-4 border-0 ${
                      activePage === 1 ? 'active-pagination' : ''
                    }`}
                    onClick={() => setActivePage(1)}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className={`item-pagination flex-c-m trans-0-4 border-0 ${
                      activePage === 2 ? 'active-pagination' : ''
                    }`}
                    onClick={() => setActivePage(2)}
                  >
                    2
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-md-4 col-lg-3">
              <div className="sidebar2 p-t-80 p-b-80 p-l-20 p-l-0-md p-t-0-md">
                {/* Search */}
                <div className="search-sidebar2 size12 bo2 pos-relative">
                  <input
                    className="input-search-sidebar2 txt10 p-l-20 p-r-55"
                    type="text"
                    name="search"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-search-sidebar2 flex-c-m ti-search trans-0-4 border-0 bg-transparent"
                    aria-label="Search"
                  >
                    <i className="fa fa-search" aria-hidden="true"></i>
                  </button>
                </div>

                {/* Categories */}
                <div className="categories">
                  <h4 className="txt33 bo5-b p-b-35 p-t-58">Categories</h4>

                  <ul>
                    {blogCategories.map((cat, idx) => (
                      <li key={idx} className="bo5-b p-t-8 p-b-8">
                        <a
                          href="#category"
                          onClick={(e) => e.preventDefault()}
                          className="txt27"
                        >
                          {cat}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Most Popular */}
                <div className="popular">
                  <h4 className="txt33 p-b-35 p-t-58">Most popular</h4>

                  <ul>
                    {popularPosts.map((item, idx) => (
                      <li key={idx} className="flex-w m-b-25">
                        <div className="size16 bo-rad-10 wrap-pic-w of-hidden m-r-18">
                          <Link to="/Blog">
                            <img src={getImage(item.image)} alt="IMG-BLOG" />
                          </Link>
                        </div>

                        <div className="size28">
                          <Link to="/Blog" className="dis-block txt28 m-b-8">
                            {item.title}
                          </Link>

                          <span className="txt14">{item.date}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Archive */}
                <div className="archive">
                  <h4 className="txt33 p-b-20 p-t-43">Archive</h4>

                  <ul>
                    {blogArchives.map((arch, idx) => (
                      <li key={idx} className="flex-sb-m p-t-8 p-b-8">
                        <a
                          href="#archive"
                          onClick={(e) => e.preventDefault()}
                          className="txt27"
                        >
                          {arch.month}
                        </a>

                        <span className="txt29">({arch.count})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
