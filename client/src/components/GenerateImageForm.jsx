import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import Button from "./Button"
import TextInput from "./TextInput"
import { AutoAwesome, CreateRounded } from "@mui/icons-material"
import { CreatePost, GenerateAIImage } from "../api"

const Form = styled.div`
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 9%;
  justify-content: center;
`

const Top = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.div`
  font-size: 28px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_primary};
`

const Desc = styled.div`
  font-size: 17px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary};
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary};
`

const Actions = styled.div`
  flex: 1;
  display: flex;
  gap: 8px;
`

const GenerateImageForm = ({
  post,
  setPost,
  createPostLoading,
  setGenerateImageLoading,
  generateImageLoading,
  setCreatePostLoading,
}) => {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const generateImageFun = async () => {
    if (!post.prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setGenerateImageLoading(true)
    setError("")

    console.log("Sending prompt:", post.prompt) // Debug log

    try {
      const res = await GenerateAIImage({ prompt: post.prompt })
      console.log("API Response:", res) // Debug log
      
      setPost({
        ...post,
        photo: `data:image/jpeg;base64,${res?.data?.photo}`,
      })
    } catch (error) {
      console.error("Generate Image Error:", error)
      console.error("Error response:", error.response?.data) // Debug log
      
      if (error.response?.status === 400) {
        setError("Invalid prompt. Please try a different prompt.")
      } else if (error.response?.status === 401) {
        setError("Invalid API key. Please check your OpenAI configuration.")
      } else {
        setError(error?.response?.data?.message || "Failed to generate image")
      }
    } finally {
      setGenerateImageLoading(false)
    }
  }

  const createPostFun = async () => {
    setCreatePostLoading(true)
    setError("")

    try {
      await CreatePost(post)
      navigate("/")
    } catch (error) {
      console.error("Create Post Error:", error)
      setError(error?.response?.data?.message || "Failed to create post")
    } finally {
      setCreatePostLoading(false)
    }
  }

  return (
    <Form>
      <Top>
        <Title>Generate Image with prompt</Title>
        <Desc>Write your prompt according to the image you want to generate!</Desc>
      </Top>
      <Body>
        <TextInput
          label="Author"
          placeholder="Enter your name.."
          name="name"
          value={post.name}
          handelChange={(e) => setPost({ ...post, name: e.target.value })}
        />
        <TextInput
          label="Image Prompt"
          placeholder="Write a detailed prompt about the image . . . "
          name="prompt"
          rows="8"
          textArea
          value={post.prompt}
          handelChange={(e) => setPost({ ...post, prompt: e.target.value })}
        />
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        <div style={{ fontSize: "12px", color: "#888" }}>
          ** You can post the AI Generated Image to the Community **
        </div>
      </Body>

      

<Actions>
        <Button
          text="Generate Image"
          flex
          leftIcon={<AutoAwesome />}
          isLoading={generateImageLoading}
          isDisabled={!post.prompt.trim()}
          onClick={generateImageFun}
        />
        <Button
          text="Post Image"
          flex
          type="secondary"
          leftIcon={<CreateRounded />}
          isLoading={createPostLoading}
          isDisabled={!post.name.trim() || !post.prompt.trim() || !post.photo}
          onClick={createPostFun}
        />
      </Actions>

    </Form>
  )
}

export default GenerateImageForm