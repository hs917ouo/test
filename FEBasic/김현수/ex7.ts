const POST_URL = "https://jsonplaceholder.typicode.com/posts";
const COMMENT_URL = "https://jsonplaceholder.typicode.com/comments";

interface Post {
  id: number;
  title: string;
}

interface Comment {
  postId: number;
  id: number;
  email: string;
  body: string;
}

export async function getPosts(userId: number | string) {
  const postsResponse = await fetch(`${POST_URL}?userId=${userId}`);
  const postsData: unknown = await postsResponse.json();

  // postsData가 배열인지 확인
  if (!Array.isArray(postsData)) {
    throw new Error("Invalid posts data");
  }

  // 각 요소가 Post 타입인지 확인
  const posts: Post[] = postsData.filter((post): post is Post => {
    return typeof post.id === "number" && typeof post.title === "string";
  });

  const commentsResponse = await fetch(
    `${COMMENT_URL}?postId=${posts.map((post) => post.id).join("&postId=")}`,
  );
  const commentsData: unknown = await commentsResponse.json();

  // commentsData가 배열인지 확인
  if (!Array.isArray(commentsData)) {
    throw new Error("Invalid comments data");
  }

  // 각 요소가 Comment 타입인지 확인
  const comments: Comment[] = commentsData.filter(
    (comment): comment is Comment => {
      return (
        typeof comment.postId === "number" &&
        typeof comment.id === "number" &&
        typeof comment.email === "string" &&
        typeof comment.body === "string"
      );
    },
  );

  // 각 게시글에 댓글을 추가하여 반환, name 필드는 제거
  const postsWithComments = posts.map((post) => {
    return {
      postId: post.id,
      title: post.title,
      comments: comments
        .filter((comment) => comment.postId === post.id)
        .map(({ postId, id, email, body }) => ({ postId, id, email, body })), // 필요한 필드만 남기기
    };
  });

  return postsWithComments;
}
