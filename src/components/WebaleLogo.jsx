/**
 * WebaleLogo.jsx
 * Destination: src/components/WebaleLogo.jsx
 *
 * Props:
 *   variant  — 'full'    : W + "Webale!" + "Private Group Fundraising"
 *              'compact' : W + "Webale!" (no tagline) — use in navbar
 *              'icon'    : W only — use on mobile / favicon contexts
 *   theme    — 'light'   : navy W, dark text  (light backgrounds)
 *              'dark'    : white W, white text (dark/navy backgrounds)
 *   size     — 'xs' | 'sm' | 'md' | 'lg' | 'xl'  (controls W image height)
 *              or a number in px
 *   className, style — passed to wrapper div
 */

const W_NAVY  = "data:image/png;base64,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lFIYDod4+fIlAMD3fViWhefPn2M4HAIrZsFHR0cIwxBHR0cYDofSE/Kq4drrCESEs7MzBEEApRR838fh4SGGwyH29vaWNi9bJdMwGAzw77//wnEcJohKNyiCcaIhiqLM8xOYDadpaEuDHoKeNPT+TMt85lNR3AiOcHp6itPTU1iWhW63CwD49ddfV7yycxARTNPEf//9h3/++afiBkUxSzo7u2/v3r279JOXr8Ec58fg/INlr2dtMI4QOLJoGIY8HhCX4KzReyTz/FyVnSRJJiu53+/TV199VRFDGZjmR9D7K13menj+cX6MKiu5ZMySs3gZT1rLrwcr8mOsLSZZDcACT0MvaT1KqUzHVm7Xe916G1x7q+Gvv/6CUgqGYcC27Uuff1V+jLXFJGVRqxS69PWsyo+xtpgWhs778B8/frzUjeB1sFjgZztxtTWukVi4VtBtdD0FDJiv93KJkBZ/nIf4+uuvi7m4gvWsDS60qx8MBtJQexXrMU0z05w7NyosA71eT5xH+s1PTcZLB6/F931KkkSaflala8sHAefdTVa9EADQO66sei0VKlRg5PspVlhjrDKgc3BwUBFihQoVKlS4ifg/mW9U+FbpNCsAAAAASUVORK5CYII=";
const W_WHITE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAABiCAYAAACcRwt/AAADc0lEQVR4nO2dyZajMAxFRU79/y/Tm6aadjB4kvSQ3l3VgkGRr2XjmJQIIYQQosu+77t3DAQICkHIC9m0LtxTEbZt245zjr+JLUuTvmI4oAg+LEm6xnyAQtgynWztSSGFsGE4yZZPBZRBn8/ISdaPhnwU1adbBK9GoQy6dIng3Rje949M89g7si4wev7I9ckcPy0HPTXiU8OUC0Xs2Xg89qxZCWaurXVf8s3tHEFTgtnzWVXWUhVBW4LV1yFzXDaClQQ997SMpZcj9pVfnlmv2H5VBA8JVqKVwPK6+4nyWPQcXcX3EWlPnuYHHL12GbtWjOfeHnF+8hH5/0PWDrSwHL0naQhQqzSr73NQy/Gn5aCMDTTCSBxlbr1y/TVH8G507/vXQJFNi8uVRW4d86WW814Ze9pu6GtobUbkuxprV8WDUA16O2VvDm9FeHM1eHPsV2h/HoiKgNDjaqDE1vM0MSINhAhXgSP0aBQJRJJUhFUgNJx3DKPChBKBjNO0McUDz57l3auvaIlpZviArQjbX3rP49tWY8CK4AliRXhiVl6K8AIsxKQIBSuSbl1RVgxl8CJkHK/PWEkFL4IlGecGBxSBiAhF+AWxGljuHw0pAmKjohNShF40et6sjNa7ySkCERGK0NzzLB9jPd4teYUIWo3AucQ/XiGCFx6LWV5vmlEEIiIUoUqmaiCSWIS3zQ+4Z9EBjyeEXjFXi5xSBKtqsGp7mcUu75Qi3HGX4MiPsWFFqL0Ch5D0HqyGqbAilLSWYGtRUMRMI4KI/pbw1VjGkkqEOxDXDSxJI8JT0pEaRcReTNg3nSxpTXq031w4k6IirEq6VS/1GKZSiHBHb9J7j7+SEK0aiCQQATHpiIQWwfPbvBqIMYkEF+FteK5hpBUBsRp4klYENLxXNFOKwGrwTUoRyDfpRECsBt7DgkhCEdBAkEAkmQgoSUcklQhnECZvSGKmEaFM+kwjIDXgKtKIgFABzqDJlGI/AlrSEUlTEZBAFDO8CIhJRyS8CGigihlaBNSkIxJaBDSQxQwrAlrS0eIpCSsCGmjrGCUh1xHQeh9aPFewIhARCSgCWu9Di6dGOBHIGKFEQOt9aPHcEUqEM+izdDTCiLByv8EKvO/fSxgRyBwhREDrfWjxtPDKBSW0RKPFQ0he+HRAfuF/lieEEEKW8we5cszyhe65/AAAAABJRU5ErkJggg==";

const SIZE_MAP = { xs: 22, sm: 32, md: 44, lg: 60, xl: 80 };

export default function WebaleLogo({
  variant  = "full",
  theme    = "light",
  size     = "md",
  className = "",
  style     = {},
}) {
  const imgH   = typeof size === "number" ? size : (SIZE_MAP[size] ?? SIZE_MAP.md);
  const imgSrc = theme === "dark" ? W_WHITE : W_NAVY;

  // Text colours
  const nameColor    = theme === "dark" ? "#FFFFFF"               : "#0D1B2E";
  const taglineColor = theme === "dark" ? "rgba(255,255,255,0.75)": "#3A5070";

  // Scale text proportionally with icon
  const namePx    = Math.round(imgH * 0.43);
  const taglinePx = Math.round(imgH * 0.18);

  return (
    <div
      className={className}
      style={{
        display        : "inline-flex",
        alignItems     : "center",
        gap            : "3px",          // bare-minimum gap
        userSelect     : "none",
        textDecoration : "none",
        ...style,
      }}
    >
      {/* ── calligraphic W image ── */}
      <img
        src={imgSrc}
        alt="Webale W"
        style={{ height: imgH, width: "auto", display: "block", flexShrink: 0 }}
      />

      {/* ── wordmark ── */}
      {(variant === "full" || variant === "compact") && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            style={{
              fontFamily  : "'Lucida Calligraphy','Palatino Linotype',Georgia,serif",
              fontStyle   : "italic",
              fontWeight  : 700,
              fontSize    : namePx,
              color       : nameColor,
              letterSpacing: "-0.3px",
              whiteSpace  : "nowrap",
            }}
          >
            Webale!
          </span>

          {variant === "full" && (
            <span
              style={{
                fontFamily   : "'Segoe UI',sans-serif",
                fontWeight   : 400,
                fontSize     : taglinePx,
                color        : taglineColor,
                marginTop    : "3px",
                letterSpacing: "0.3px",
                whiteSpace   : "nowrap",
              }}
            >
              Private Group Fundraising
            </span>
          )}
        </div>
      )}
    </div>
  );
}
