import React, { useState } from "react";

const CardText = ({ title, value, hoverValue = null, reference_url = null }) => {
  const [showHover, setShowHover] = useState(false);

  return (
    <div className="card-cell">
      {title ? <h4>{title}</h4> : null}
      <div
        style={{
          width: `fit-content`,
        }}
      >
        <div
          onMouseOver={() => hoverValue && setShowHover(true)}
          onMouseOut={() => hoverValue && setShowHover(false)}
        >
          {showHover ? (
            <span
              style={{
                pointerEvents: `none`,
                opacity: 0.8,
              }}
            >
              <em>{hoverValue}</em>
            </span>
          ) : (
            <div
              style={{
                pointerEvents: `none`,
                display: `inline-block`,
                height: `1.1rem`,
                borderBottom: hoverValue && `1px rgb(235, 68, 62) dashed`,
              }}
            >
              {value}
              {reference_url && (
                <>
                  {" "}
                  <a 
                    href={reference_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'inherit',
                      textDecoration: 'underline',
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    (Source)
                  </a>
                </>
              )}
            </div>
          )}
        </div>
        {/* {!showHover && value} */}
      </div>
    </div>
  );
};

export default CardText;
