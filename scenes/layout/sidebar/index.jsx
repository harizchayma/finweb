import React, { useEffect, useState, useContext, useMemo } from "react";
import { Avatar, Box, IconButton, Typography, Skeleton } from "@mui/material";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { MenuOutlined } from "@mui/icons-material";
import logo from "../../../assets/images/nom.png";
import { ToggledContext } from "../../../App";
import Item from "./Item";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../context/AuthContext";
import {
  FcSurvey,
  FcTwoSmartphones,
  FcManager,
  FcAutomotive,
  FcCurrencyExchange,
  FcConferenceCall,
  FcOrgUnit,
  FcButtingIn,
  FcBriefcase,
  FcViewDetails,
  FcDonate,
  FcDebt,
  FcAssistant,
  FcCalendar,
  FcOvertime,
  FcPlanner,
  FcMoneyTransfer,
  FcHome,
  FcStatistics
} from "react-icons/fc";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const { role } = useAuth();
  const [openSection, setOpenSection] = useState(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUserName(`${userData.nom} ${userData.prenom}`);
      setUserRole(userData.role || "Utilisateur");
      const userId = userData.id;
      if (userId) fetchUserData(userId);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:7001/users/${userId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user image: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      if (data.data && data.data.image) {
        setUserImage(data.data.image);
      } else {
        console.log("User image not found for user ID:", userId);
      }
    } catch (error) {
      console.error("Error fetching user image:", error);
    }
  };

  useEffect(() => {
    if (userImage) {
      try {
        let blob;
        if (userImage.type === "Buffer") {
          const uint8Array = new Uint8Array(userImage.data);
          blob = new Blob([uint8Array], { type: "image/jpeg" });
        } else if (
          typeof userImage === "string" &&
          userImage.startsWith("data:image")
        ) {
          const base64Data = userImage.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          blob = new Blob(byteArrays, { type: "image/jpeg" });
        } else {
          console.error("Image format not supported:", userImage);
          return;
        }
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          return () => {
            URL.revokeObjectURL(url);
          };
        }
      } catch (error) {
        console.error("Error creating image URL:", error);
      }
    }
  }, [userImage]);

  const handleSectionClick = (sectionTitle) => {
    if (openSection === sectionTitle) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionTitle);
    }
  };

  const menuItemStyles = useMemo(
    () => ({
      button: {
        ":hover": {
          color: "#f7f8fc",
          background: "rgba(134, 141, 251, 0.2)",
          transition: ".4s ease",
        },
        fontSize: "1rem",
        padding: "10px 20px",
        borderRadius: "8px",
      },
    }),
    []
  );

  const menuItems = [
    {
      title: <span style={{fontSize: "1.2rem",fontWeight: "bold", color:"#031cad" }}>Tableau de bord</span>,
      path: "/",
      icon: <FcStatistics style={{ fontSize: "2rem" }} />,
      adminOnly: true, // Add a flag to indicate admin-only
    },
    {
      title: "Calendrier",
      icon: <FcCalendar style={{ fontSize: "2rem" }} />,
      items: [
        { title: "Planning des vehicules", path: "/calendar", icon: <FcOvertime style={{ fontSize: "2rem" }} /> },
        { title: " Vehicules disponible", path: "/calendarvehicule", icon: <FcPlanner style={{ fontSize: "2rem" }} /> }
      ],
    },
    {
      title: "Information de base",
      icon: <FcViewDetails style={{ fontSize: "2rem" }} />,
      items: [
        { title: "Clients", path: "/client", icon: <FcConferenceCall style={{ fontSize: "2rem" }} /> },
        { title: "Véhicules", path: "/vehicules", icon: <FcAutomotive style={{ fontSize: "2rem" }} /> },
        { title: "Catégories", path: "/categorie", icon: <FcOrgUnit style={{ fontSize: "2rem" }} /> },
      ],
    },
    {
      title: "Gestion de métier",
      icon: <FcBriefcase style={{ fontSize: "2rem" }} />,
      items: [
        { title: "Réservations", path: "/reservation", icon: <FcTwoSmartphones style={{ fontSize: "2rem" }} /> },
        { title: "Contrats", path: "/contrat", icon: <FcSurvey style={{ fontSize: "2rem" }} /> },
        { title: "Chauffeur de contrat ", path: "/chauffeur", icon: <FcButtingIn style={{ fontSize: "2rem" }} /> },
        { title: "Avances de contrat", path: "/avance", icon: <FcCurrencyExchange style={{ fontSize: "2rem" }} /> },
      ],
    },
    {
      title: "Gestion de Paiement",
      icon: <FcDebt style={{ fontSize: "2rem" }} />,
      items: [
        { title: "Paiement", path: "/paiement", icon: <FcDonate style={{ fontSize: "2rem" }} /> },
        { title: "Solde Client", path: "/Solde", icon: <FcMoneyTransfer style={{ fontSize: "2rem" }} /> }
      ],
    },
    {
      title: "Gestion d'Utilisateur",
      icon: <FcManager style={{ fontSize: "2rem" }} />,
      items: [{ title: "Utilisateur", path: "/utilisateur", icon: <FcAssistant style={{ fontSize: "2rem" }} /> }],
      adminOnly: true, // Add a flag for admin-only
    },
  ];

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{
        border: 0,
        height: "100vh",
        width: collapsed ? "60px" : "260px",
        transition: "width 0.3s ease",
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu menuItemStyles={menuItemStyles}>
        <MenuItem
          rootStyles={{ margin: "10px 0 35px 0", color: colors.gray[100] }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {!collapsed && (
              <Box display="flex" alignItems="center" gap="3px">
                <img
                  style={{
                    width: "150px",
                    height: "150px",
                    marginTop: "20px",
                    marginBottom: 5,
                  }}
                  src={logo}
                  alt="Logo"
                />
              </Box>
            )}
            <IconButton
              onClick={() => setCollapsed(!collapsed)}
              aria-label={
                collapsed
                  ? "Ouvrir la barre latérale"
                  : "Fermer la barre latérale"
              }
            >
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>

        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <Avatar
            src={imageUrl || "/fallback_user.png"}
            alt={userName || "User"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/fallback_user.png"; // Fallback image
            }}
            sx={{ width: 70, height: 70, margin: "0 auto" }}
          />
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="#302855"
            fontSize={"0.9rem"}
          >
            {userRole || <Skeleton width={40} />}
          </Typography>
          <Typography
            variant="body2"
            fontWeight="bold"
            color="#52a9ffd2"
            fontSize={"1rem"}
          >
            {userName || <Skeleton width={80} />}
          </Typography>
        </Box>

        <Box mb={2} pl={collapsed ? "" : "1%"}>
          {menuItems.map((section, index) => (
            <React.Fragment key={index}>
              {!(section.adminOnly && role !== "Admin") && (
                <>
                  {section.items ? (
                    <>
                      <MenuItem
                        onClick={() => handleSectionClick(section.title)}
                        icon={section.icon}
                        rootStyles={{
                          color: "#415cd4",
                          borderRadius: "30px",
                          padding: "2px 2px",
                          fontWeight: "bold",
                          transition: "background-color 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#75c7f687",
                            borderRadius: "30px",
                          },
                        }}
                      >
                        {section.title}
                      </MenuItem>
                      {openSection === section.title &&
                        section.items &&
                        section.items.map((item, index) => (
                          <Item
                            key={index}
                            title={item.title}
                            path={item.path}
                            icon={item.icon}
                          />
                        ))}
                    </>
                  ) : (
                    <Item
                      title={section.title}
                      path={section.path}
                      icon={section.icon}
                    />
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Menu>
    </Sidebar>
  );
};

export default SideBar;