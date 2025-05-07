import { useNavigate } from 'react-router-dom';

interface NavigationOptions {
  path: string;
  state?: Record<string, any>;
  replace?: boolean;
}
export const useNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = ({ path, state, replace = false }: NavigationOptions) => {
    navigate(path, { state, replace });
  };

  return {
    navigateTo,
  };
};
