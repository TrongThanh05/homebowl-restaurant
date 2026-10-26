// src/pages/BlogDetail.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getImage } from '../utils/images';
import {
  blogPosts,
  blogCategories,
  popularPosts,
  blogArchives,
} from '../data/blog';

export default function BlogDetail() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [commentData, setCommentData] = useState({
    comment: '',
    name: '',
    email: '',
    website: '',
  });

  const post = blogPosts.find((p) => p.id === Number(id)) || blogPosts[0];

  const handleCommentChange = (e) => {
    setCommentData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for your comment, ${commentData.name}!`);
    setCommentData({ comment: '', name: '', email: '', website: '' });
  };

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
        {/* Breadcrumb */}
        <div className="bread-crumb bo5-b p-t-17 p-b-17">
          <div className="container">
            <Link to="/" className="txt27">
              Home
            </Link>
            <span className="txt29 m-l-10 m-r-10">/</span>
            <Link to="/Blog" className="txt27">
              Blog
            </Link>
            <span className="txt29 m-l-10 m-r-10">/</span>
            <span className="txt29">{post.title}</span>
          </div>
        </div>

        <div className="container">
          <div className="row">
            {/* Main Content */}
            <div className="col-md-8 col-lg-9">
              <div className="p-t-80 p-b-124 bo5-r p-r-50 h-full p-r-0-md bo-none-md">
                {/* Block4 */}
                <div className="blo4 p-b-63">
                  <div className="pic-blo4 hov-img-zoom bo-rad-10 pos-relative">
                    <img src={getImage(post.image)} alt="IMG-BLOG" />

                    <div className="date-blo4 flex-col-c-m">
                      <span className="txt30 m-b-4">{post.day}</span>
                      <span className="txt31">{post.monthYear}</span>
                    </div>
                  </div>

                  <div className="text-blo4 p-t-33">
                    <h4 className="p-b-16">
                      <span className="tit9">{post.title}</span>
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

                    <p className="p-b-25">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Vivamus eget mi sem. Nulla facilisi. Sed ultricies eros a
                      nibh tempus, in sodales mi vestibulum. Nullam quis dui ac nisl
                      ultrices euismod et sit amet urna. Morbi semper sapien quis ex
                      tempor, sit amet scelerisque eros rhoncus. Cras scelerisque
                      auctor gravida. Nunc fermentum luctus rhoncus. Nulla vulputate
                      fermentum convallis. In quis pellentesque tortor. Cras metus
                      nibh, gravida vitae ante vel, finibus semper tellus. Nulla vel
                      tincidunt magna. Morbi tempor velit lectus, eu commodo quam
                      volutpat vitae.
                    </p>

                    <p className="p-b-25">
                      Aenean pharetra tortor dui in pellentesque. Duis elementum
                      condimentum ante, ac aliquet turpis mollis non. Vivamus
                      tincidunt sem quis quam fermentum convallis. Sed fermentum
                      eros vitae eros convallis, at luctus ex commodo.
                    </p>
                  </div>
                </div>

                {/* Leave a comment */}
                <form
                  className="leave-comment p-t-10"
                  onSubmit={handleCommentSubmit}
                >
                  <h4 className="txt33 p-b-14">Leave a Comment</h4>

                  <p>
                    Your email address will not be published. Required fields are
                    marked *
                  </p>

                  <textarea
                    className="bo-rad-10 size29 bo2 txt10 p-l-20 p-t-15 m-b-10 m-t-40 bgwhite"
                    name="comment"
                    placeholder="Comment..."
                    value={commentData.comment}
                    onChange={handleCommentChange}
                    required
                  ></textarea>

                  <div className="size30 bo2 bo-rad-10 m-t-3 m-b-20 bgwhite">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                      type="text"
                      name="name"
                      placeholder="Name *"
                      value={commentData.name}
                      onChange={handleCommentChange}
                      required
                    />
                  </div>

                  <div className="size30 bo2 bo-rad-10 m-t-3 m-b-20 bgwhite">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                      type="email"
                      name="email"
                      placeholder="Email *"
                      value={commentData.email}
                      onChange={handleCommentChange}
                      required
                    />
                  </div>

                  <div className="size30 bo2 bo-rad-10 m-t-3 m-b-30 bgwhite">
                    <input
                      className="bo-rad-10 sizefull txt10 p-l-20 border-0"
                      type="text"
                      name="website"
                      placeholder="Website"
                      value={commentData.website}
                      onChange={handleCommentChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn3 flex-c-m size31 txt11 trans-0-4"
                  >
                    Post Comment
                  </button>
                </form>
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
                        <Link to="/Blog" className="txt27">
                          {cat}
                        </Link>
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
                        <Link to="/Blog" className="txt27">
                          {arch.month}
                        </Link>

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
