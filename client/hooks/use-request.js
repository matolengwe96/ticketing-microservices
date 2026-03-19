import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const res = await fetch(url, {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...body, ...props }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msgs = data.errors || [{ message: data.message || 'Something went wrong' }];
        setErrors(
          <div className="alert alert-danger mt-2">
            <ul className="mb-0">
              {msgs.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          </div>
        );
        return null;
      }

      if (onSuccess) onSuccess(data);
      return data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger mt-2">Network error — is the service running?</div>
      );
      return null;
    }
  };

  return { doRequest, errors };
};

export default useRequest;
