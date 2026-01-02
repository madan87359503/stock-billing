import React, { useState, useRef, useEffect } from "react";

export default function ProductDropdown(props) {
  const { value, onChange, options, placeholder } = props;

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filtered = (options || []).filter(function (o) {
    return o.toLowerCase().includes(value.toLowerCase());
  });

  return React.createElement(
    "div",
    { ref: wrapperRef, style: { position: "relative", width: "200px" } },

    React.createElement("label", null, "Product"),

    React.createElement("input", {
      value: value,
      placeholder: placeholder || "Product",
      onChange: function (e) {
        onChange(e.target.value); // allow new value
        setOpen(true);
      },
      onFocus: function () {
        setOpen(true);
      }
    }),

    open && filtered.length > 0 &&
      React.createElement(
        "div",
        { className: "dropdown" },
        filtered.map(function (o) {
          return React.createElement(
            "div",
            {
              key: o,
              className: "dropdown-item",
              onMouseDown: function () {
                onChange(o);
                setOpen(false);
              }
            },
            o
          );
        })
      )
  );
}
