import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import axios from "axios";

const CategoryCard = ({categoryId}) => {
    const [categoryInfo, setCategoryInfo] = useState({});

  useEffect (() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/data/oneCategory`, {
          params: {
            categoryId: categoryId 
          }
        });
        setCategoryInfo(response.data[0]);
      } catch (error) {
        console.error('Error fetching data:', error); 
      }
    };

    fetchCategory();
  }, [categoryId]);

    return(<>
        {categoryInfo && categoryInfo.categoryName ? (
            <Card className="max-w-xl">
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={`${import.meta.env.VITE_BACKEND_URL}/api/cdn/category/${categoryId}`}
                  alt={categoryInfo.categoryName}
                />
                <div className="pl-2">{categoryInfo.categoryName}</div>
                <div className="pl-2">{categoryInfo.description}</div>
              </CardActionArea>
            </Card>
          ) : null}
    </>);
}

export default CategoryCard;